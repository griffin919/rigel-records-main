# Firestore Data Models

This document defines the structure of all Firestore collections used in the application.

## Collections Overview

1. **users** - User accounts with authentication
2. **drivers** - Driver-specific details (subset of users with role='driver')
3. **companies** - Company information
4. **transactions** - Transaction records
5. **items** - Inventory items (fuel, products, etc.)
6. **audit_logs** - System audit trail

---

## 1. users Collection

**Path**: `/users/{userId}`

Stores all user accounts including admins, managers, attendants, company representatives, company-managers, and drivers.

```javascript
{
  uid: string,                    // Document ID (Firebase Auth UID)
  email: string,                  // User email (required)
  displayName: string,            // Full name (required)
  role: string,                   // 'admin' | 'manager' | 'attendant' | 'company' | 'company-manager' | 'driver'
  active: boolean,                // Account status (default: true)
  phone: string,                  // Phone number for SMS (optional, format: 0XXXXXXXXX or 233XXXXXXXXX)
  companyId: string | null,       // Company ID (required for 'company-manager' and 'driver' roles)
  createdAt: string,              // ISO timestamp
  createdBy: string               // UID of user who created this account
}
```

### Role Descriptions:
- **admin**: Full system access, can create/delete any account
- **manager**: Similar to admin but cannot create/delete admin accounts
- **attendant**: Can serve transactions, view their own reports
- **company**: Company owner/representative
- **company-manager**: Manages a specific company, can create drivers for that company
- **driver**: Driver associated with a company, receives transaction notifications

---

## 2. drivers Collection

**Path**: `/drivers/{driverId}`

Additional driver-specific information. The `driverId` matches the user's `uid` in the users collection.

```javascript
{
  id: string,                     // Document ID (same as user uid)
  name: string,                   // Driver name (same as displayName in users)
  email: string,                  // Driver email
  phone: string,                  // Phone number (format: 0XXXXXXXXX or 233XXXXXXXXX)
  carNumber: string,              // Vehicle registration number
  companyId: string,              // Associated company ID (required)
  active: boolean,                // Driver status
  createdAt: string,              // ISO timestamp
  createdBy: string               // UID of user who created this driver
}
```

**Note**: When a user with role='driver' is created, a corresponding document is automatically created in the drivers collection.

---

## 3. companies Collection

**Path**: `/companies/{companyId}`

Company information and settings.

```javascript
{
  id: string,                     // Document ID (auto-generated)
  name: string,                   // Company name (required)
  contactPerson: string,          // Primary contact person
  location: string,               // Physical address
  phone: string,                  // Contact phone number
  drivers: Array<{                // Legacy: Simple driver list (deprecated, use drivers collection)
    name: string,
    phone: string,
    carNumber: string
  }>,
  createdAt: Timestamp            // Firestore server timestamp
}
```

**Migration Note**: The `drivers` array is deprecated. Use the `drivers` collection filtered by `companyId` instead.

---

## 4. transactions Collection

**Path**: `/transactions/{transactionId}`

Records of all fuel/product transactions.

```javascript
{
  id: string,                     // Document ID (auto-generated)
  companyId: string,              // Company ID (required)
  company: string,                // Company name
  driverId: string,               // Driver user ID (matches uid in users collection)
  driverName: string,             // Driver name (required)
  phone: string,                  // Driver phone number for SMS
  carNumber: string,              // Vehicle registration
  itemId: string,                 // Item/product ID
  itemName: string,               // Item/product name
  itemUnit: string,               // Unit of measurement (e.g., 'L', 'kg')
  quantity: number,               // Quantity purchased
  fuelQuantity: number,           // Backward compatibility alias for quantity
  cost: number,                   // Total cost in GHS
  pointsEarned: number,           // Loyalty points earned
  couponNumber: string,           // Coupon/voucher number (optional)
  photoURL: string,               // Receipt/proof photo URL (optional)
  paid: boolean,                  // Payment status (default: false)
  servedBy: string,               // Attendant/staff name
  servedById: string,             // Attendant user ID
  createdAt: Timestamp            // Firestore server timestamp
}
```

### SMS Notifications:
- **On creation**: SMS sent to driver (transaction details) and company-managers (notification)
- **On payment**: SMS sent to driver (payment confirmation)

---

## 5. items Collection

**Path**: `/items/{itemId}`

Inventory items (fuel types, products, services).

```javascript
{
  id: string,                     // Document ID (auto-generated)
  name: string,                   // Item name (required)
  unit: string,                   // Unit of measurement (required, e.g., 'L', 'kg', 'pcs')
  color: string,                  // Display color (hex, default: '#3b82f6')
  price: number,                  // Unit price in GHS
  points: number,                 // Loyalty points per unit
  description: string,            // Item description (optional)
  createdAt: Timestamp            // Firestore server timestamp
}
```

---

## 6. audit_logs Collection

**Path**: `/audit_logs/{logId}`

System audit trail for tracking user actions.

```javascript
{
  id: string,                     // Document ID (auto-generated)
  action: string,                 // Action type (e.g., 'user_created', 'user_deleted', 'user_deactivated')
  performedBy: string,            // UID of user who performed the action
  performedByEmail: string,       // Email of user who performed the action (optional)
  performedByRole: string,        // Role of user who performed the action
  targetUserId: string,           // UID of affected user (optional)
  targetUserEmail: string,        // Email of affected user (optional)
  targetUserRole: string,         // Role of affected user (optional)
  companyId: string | null,       // Related company ID (optional)
  timestamp: string,              // ISO timestamp
  details: object                 // Additional action-specific data
}
```

### Common Actions:
- `user_created`: New user account created
- `user_deleted`: User account deleted
- `user_deactivated`: User account deactivated
- `transaction_updated`: Transaction modified
- `payment_confirmed`: Transaction marked as paid

---

## Data Relationships

```
companies (1) ────┬──── (many) users [role=company-manager]
                  │
                  └──── (many) drivers
                  │
                  └──── (many) transactions

users (1) ───────┬──── (many) audit_logs [as performer]
                 │
                 └──── (1) drivers [if role=driver]
                 │
                 └──── (many) transactions [as servedById or driverId]

items (1) ──────── (many) transactions
```

---

## Indexes Required

### Firestore Composite Indexes:

1. **transactions**:
   - `companyId` ASC + `createdAt` DESC
   - `driverId` ASC + `createdAt` DESC
   - `servedById` ASC + `createdAt` DESC

2. **users**:
   - `companyId` ASC + `role` ASC
   - `role` ASC + `active` ASC

3. **drivers**:
   - `companyId` ASC + `active` ASC

4. **audit_logs**:
   - `performedBy` ASC + `timestamp` DESC
   - `targetUserId` ASC + `timestamp` DESC
   - `action` ASC + `timestamp` DESC

---

## Phone Number Format

All phone numbers should be stored and transmitted in one of these formats:
- **Local**: `0XXXXXXXXX` (10 digits starting with 0)
- **International**: `233XXXXXXXXX` (12 digits)

The SMS service automatically converts local format to international format before sending.

---

## Migration Notes

### From Old Driver System to New:
1. Old system stored drivers as an array in `companies.drivers`
2. New system uses separate `drivers` collection and `users` collection with role='driver'
3. When querying drivers, always use the `drivers` collection filtered by `companyId`

### Transaction Driver Tracking:
- Always include both `driverId` (user uid) and `driverName` (display name)
- `driverId` is used for filtering and permissions
- `driverName` is used for display and legacy compatibility

---

## Environment Variables

### SMS Configuration (Nalo Solutions):
- `NALO_USERNAME`: Nalo API username (default: 'Rigelis')
- `NALO_PASSWORD`: Nalo API password
- `NALO_SOURCE`: SMS sender ID (default: 'RigelOS')

### Firebase Configuration:
- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NUXT_PUBLIC_FIREBASE_APP_ID`
- `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

---

Last Updated: December 10, 2025
