const logger = require('../logger');
const phoneUtils = require('../utils/phoneUtils');
const smsSettingsDB = require('../db/smsSettings');
const companySmsSettingsDB = require('../db/companySmsSettings');

// Import fetch - works in both Node.js < 18 and >= 18
let fetch;
if (globalThis.fetch) {
  // Node.js 18+ has native fetch
  fetch = globalThis.fetch;
} else {
  // Node.js < 18 needs node-fetch
  fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

/**
 * SMS Service supporting multiple providers (Nalo Solutions & MNotify)
 * Sends OTP, order notifications, and bulk SMS campaigns
 * Provider selection is now managed via database (sms_settings table)
 */

// Nalo Solutions Configuration (from environment)
const NALO_USERNAME = process.env.NALO_USERNAME || 'Rigelis';
const NALO_PASSWORD = process.env.NALO_PASSWORD || 'Maestro1985@';
const NALO_SOURCE = process.env.NALO_SOURCE || 'KrapaShell';

// MNotify Configuration (from environment)
const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY || 'RXttUY1ZnvmlhGb1ovXx8iV1h';
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID;

/**
 * Get active SMS provider from database
 * Falls back to 'nalo' if not configured
 */
const getActiveProvider = async () => {
  try {
    const settings = await smsSettingsDB.getActiveSMSSettings();
    return settings?.active_provider || 'nalo';
  } catch (error) {
    logger.warn('Failed to get active provider from DB, using default (nalo):', error);
    return 'nalo';
  }
};

/**
 * Get company sender ID from database
 * Falls back to MNOTIFY_SENDER_ID if company doesn't have custom sender ID
 * Falls back to NALO_SOURCE for Nalo provider
 */
const getCompanySenderID = async (companyId, provider = null) => {
  try {
    if (!companyId) {
      // No company ID - use default based on provider
      if (!provider) {
        provider = await getActiveProvider();
      }
      return provider === 'nalo' ? NALO_SOURCE : MNOTIFY_SENDER_ID;
    }

    // Get the provider if not specified
    if (!provider) {
      provider = await getActiveProvider();
    }

    // Try to get company-specific sender ID from database
    const senderID = await companySmsSettingsDB.getCompanySenderID(companyId);

    // Return company sender ID if exists, otherwise use default based on provider
    if (senderID) {
      return senderID;
    }

    // Fallback to default based on provider
    return provider === 'nalo' ? NALO_SOURCE : MNOTIFY_SENDER_ID;
  } catch (error) {
    logger.warn('Failed to get company sender ID from DB, using default:', error);
    // Fallback to default based on provider or global default
    if (!provider) {
      provider = await getActiveProvider();
    }
    return provider === 'nalo' ? NALO_SOURCE : MNOTIFY_SENDER_ID;
  }
};

/**
 * Format phone number for international format (233XXXXXXXXX)
 * @deprecated Use phoneUtils.normalizePhoneNumber instead
 */
const formatPhoneNumber = (phone) => {
  return phoneUtils.normalizePhoneNumber(phone);
};

/**
 * Send SMS via Nalo Solutions API
 * @param {string} phoneNumber - Phone number to send to
 * @param {string} message - Message content
 * @param {string} senderId - Custom sender ID (optional, defaults to NALO_SOURCE)
 */
const sendViaNalo = async (phoneNumber, message, senderId = null) => {
  try {
    console.log('Nalo SMS message:', message);
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error('Invalid phone number format');
    }

    // Use provided sender ID or default to NALO_SOURCE (KrapaShell)
    const source = senderId || NALO_SOURCE;

    logger.info('Sending SMS via Nalo to:', formattedPhone, 'with sender ID:', source);

    const url = `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${encodeURIComponent(NALO_USERNAME)}&password=${encodeURIComponent(NALO_PASSWORD)}&type=0&destination=${encodeURIComponent(formattedPhone)}&dlr=1&source=${encodeURIComponent(source)}&message=${encodeURIComponent(message)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🚀 Nalo Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🚀 Nalo SMS Provider Error Response:', errorText);
      logger.error('Nalo SMS API error:', { status: response.status, error: errorText });
      throw new Error(`Nalo SMS API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.text();
    console.log('🚀 Nalo SMS Provider Response:', responseData);

    // Check for Nalo error codes in the response
    // Nalo returns errors in format: "1709:User validation failed"
    // Success format: "1000:Success" or just a message ID
    if (responseData.includes(':')) {
      const [code, message] = responseData.split(':');
      const errorCode = parseInt(code);

      // Common Nalo error codes:
      // 1709: User validation failed
      // 1710: Invalid credentials
      // 1025: Insufficient balance
      // 1000: Success
      if (errorCode !== 1000 && errorCode >= 1001) {
        console.log('🚀 Nalo SMS Provider Error - Code:', errorCode, 'Message:', message);
        logger.error('Nalo SMS API error:', { code: errorCode, error: message });
        throw new Error(`Nalo SMS error (${errorCode}): ${message}`);
      }
    }

    logger.info('SMS sent successfully via Nalo:', responseData);

    return {
      success: true,
      provider: 'nalo',
      message: 'SMS sent successfully',
      data: responseData,
      messageId: responseData.split(':')[1]?.trim() || null
    };
  } catch (error) {
    logger.error('Error sending SMS via Nalo:', error);
    throw error;
  }
};

/**
 * Send SMS via MNotify API
 */
const sendViaMNotify = async (phoneNumber, message, senderId = null) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error('Invalid phone number format');
    }

    logger.info('Sending SMS via MNotify to:', formattedPhone);

    const url = `https://api.mnotify.com/api/sms/quick?key=${MNOTIFY_API_KEY}`;

    const requestBody = {
      recipient: [formattedPhone],
      sender: senderId || MNOTIFY_SENDER_ID,
      message: message,
      is_schedule: false,
      schedule_date: ''
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      timeout: 30000
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🚀 MNotify SMS Provider Error Response:', errorText);
      logger.error('MNotify SMS API error:', { status: response.status, error: errorText });
      throw new Error(`MNotify SMS API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('🚀 MNotify SMS Provider Response:', JSON.stringify(responseData, null, 2));
    logger.info('SMS sent successfully via MNotify:', responseData);

    // Check MNotify response format
    const isSuccess = responseData.status === 'success' ||
      responseData.code === 200 ||
      responseData.code === '200';

    if (!isSuccess) {
      const errorMsg = responseData.message || responseData.error || 'Failed to send SMS via MNotify';
      throw new Error(errorMsg);
    }

    return {
      success: true,
      provider: 'mnotify',
      message: 'SMS sent successfully',
      data: responseData,
      messageId: responseData.message_id || responseData.id || 'mnotify_' + Date.now()
    };
  } catch (error) {
    logger.error('Error sending SMS via MNotify:', error);
    throw error;
  }
};

/**
 * Send SMS via specified provider (unified interface)
 * Now auto-detects provider from database if not specified
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message content
 * @param {string} provider - SMS provider ('nalo' or 'mnotify'), null to use DB settings
 * @param {string} senderId - Custom sender ID (optional, for MNotify)
 * @param {number} companyId - Company ID (optional, to get company-specific sender ID)
 */
const sendSMS = async (phoneNumber, message, provider = null, senderId = null, companyId = null) => {

  try {
    // If provider not specified, get from database
    if (!provider) {
      provider = await getActiveProvider();
    }

    // If senderId not specified and we have a companyId, get company sender ID
    if (!senderId && companyId) {
      senderId = await getCompanySenderID(companyId, provider);
    }

    if (provider === 'mnotify') {
      return await sendViaMNotify(phoneNumber, message, senderId);
    } else {
      return await sendViaNalo(phoneNumber, message, senderId);
    }
  } catch (error) {
    logger.error(`Error sending SMS via ${provider}:`, error);
    throw error;
  }
};

/**
 * Send OTP verification code
 * Now uses database-configured provider
 */
const sendOTP = async (phoneNumber, otp, provider = null, companyId = null) => {
  const message = `Your verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
  return await sendSMS(phoneNumber, message, provider, null, companyId);
};

/**
 * Send OTP for password setup (first-time login)
 * Now uses database-configured provider
 */
const sendSetupOTP = async (phoneNumber, otp, companyCount, provider = null, companyId = null) => {
  const companyText = companyCount > 1 ? `${companyCount} pharmacies` : '1 pharmacy';
  const message = `Welcome! Your account setup code is: ${otp}. You have accounts at ${companyText}. Valid for 10 minutes.`;
  return await sendSMS(phoneNumber, message, provider, null, companyId);
};

/**
 * Send order confirmation to customer
 * Now uses database-configured provider
 */
const sendOrderConfirmation = async (phoneNumber, orderDetails, provider = null, companyId = null) => {
  const { order_id, total_amount, items_count, company_name } = orderDetails;
  const message = `Order ${order_id} confirmed! ${items_count} items, Total: GHS ${total_amount}. ${company_name} will process your order soon. Thank you!`;
  return await sendSMS(phoneNumber, message, provider, null, companyId);
};

/**
 * Send order notification to company WhatsApp
 * Now uses database-configured provider
 */
const sendOrderNotificationToCompany = async (whatsappNumber, orderDetails, provider = null, companyId = null) => {
  const { order_id, customer_name, customer_phone, total_amount, items_count } = orderDetails;
  const message = `🛒 NEW ORDER ${order_id}\nCustomer: ${customer_name}\nPhone: ${customer_phone}\nItems: ${items_count}\nTotal: GHS ${total_amount}\nPlease process this order.`;
  return await sendSMS(whatsappNumber, message, provider, null, companyId);
};

/**
 * Send order status update to customer
 * Now uses database-configured provider
 */
const sendOrderStatusUpdate = async (phoneNumber, orderDetails, provider = null, companyId = null) => {
  const { order_id, status, company_name } = orderDetails;

  const statusMessages = {
    confirmed: `Your order ${order_id} has been confirmed by ${company_name}.`,
    shipped: `Your order ${order_id} has been shipped! It's on the way.`,
    delivered: `Your order ${order_id} has been delivered. Thank you for shopping with ${company_name}!`,
    cancelled: `Your order ${order_id} has been cancelled. Contact ${company_name} if you have questions.`
  };

  const message = statusMessages[status] || `Order ${order_id} status: ${status}`;
  return await sendSMS(phoneNumber, message, provider, null, companyId);
};

/**
 * Send bulk SMS to multiple recipients (for campaigns)
 * Now uses database-configured provider by default
 * Uses company-specific sender ID if available, otherwise falls back to default
 * @param {Array} recipients - Array of {phone, message} objects
 * @param {string} provider - SMS provider ('nalo' or 'mnotify'), null to use DB settings
 * @param {string} senderId - Custom sender ID (optional, for MNotify)
 * @param {number} companyId - Company ID (optional, to get company-specific sender ID)
 * @param {Function} onProgress - Callback for progress updates (optional)
 * @returns {Object} - Summary of sent messages
 */
const sendBulkSMS = async (recipients, provider = null, senderId = null, companyId = null, onProgress = null) => {
  // If provider not specified, get from database
  if (!provider) {
    provider = await getActiveProvider();
  }

  // If senderId not specified and we have a companyId, get company sender ID
  if (!senderId && companyId) {
    senderId = await getCompanySenderID(companyId, provider);
  }

  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    details: []
  };

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];

    try {
      const result = await sendSMS(recipient.phone, recipient.message, provider, senderId, companyId);

      results.sent++;
      results.details.push({
        phone: recipient.phone,
        status: 'sent',
        messageId: result.messageId,
        recipientId: recipient.id
      });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          status: 'sent',
          recipientId: recipient.id
        });
      }

      // Rate limiting: delay between messages (adjust as needed)
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }

    } catch (error) {
      results.failed++;
      results.details.push({
        phone: recipient.phone,
        status: 'failed',
        error: error.message,
        recipientId: recipient.id
      });

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          status: 'failed',
          error: error.message,
          recipientId: recipient.id
        });
      }

      logger.error(`Failed to send SMS to ${recipient.phone}:`, error);
    }
  }

  return results;
};

module.exports = {
  formatPhoneNumber,
  getActiveProvider,
  getCompanySenderID,
  sendSMS,
  sendViaNalo,
  sendViaMNotify,
  sendOTP,
  sendSetupOTP,
  sendOrderConfirmation,
  sendOrderNotificationToCompany,
  sendOrderStatusUpdate,
  sendBulkSMS
};
