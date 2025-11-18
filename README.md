# Rigel Records - Fuel Management System

A modern, full-featured fuel management system built with Nuxt 3 and Firebase. This application helps manage fuel purchases, track transactions, and generate reports for multiple companies.

## Features

- 🔐 **Authentication System** - Secure login with role-based access (Admin/Attendant)
- 👥 **User Management** - Admin can create and manage user accounts
- 🏢 **Company Management** - Track multiple client companies
- ⛽ **Transaction Recording** - Record fuel purchases with detailed information
- 📊 **Reporting** - Generate and export transaction reports
- 💳 **Payment Tracking** - Mark transactions as paid/unpaid
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔔 **Toast Notifications** - Real-time feedback for user actions

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Backend**: Nuxt Server API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Custom CSS with modern design system

## Setup

Make sure to install dependencies:

```bash
npm install
```

### Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy `.env.example` to `.env` and fill in your Firebase credentials

### Create Initial Admin User

Use the setup API endpoint to create the first admin user:

```bash
curl -X POST http://localhost:3000/api/setup -H "Content-Type: application/json" -d "{ \"email\": \"admin@example.com\", \"password\": \"secure-password\", \"displayName\": \"Admin User\" }"
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## User Roles

- **Admin**: Full access to manage companies, users, and view reports
- **Attendant**: Can record fuel transactions and view recent entries

## Firebase Collections

### users
- email, displayName, role, createdAt, createdBy

### companies
- name, contactPerson, location, phone, createdAt

### transactions
- companyId, company, driverName, phone, carNumber, fuelQuantity, cost, paid, createdAt

---

Built with ❤️ using Nuxt 3 and Firebase
