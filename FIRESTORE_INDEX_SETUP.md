# Firestore Index Setup

## Required Index

To enable transaction filtering by attendant, you need to create a composite index in Firestore:

### Method 1: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Create Index"
5. Configure the index:
   - Collection ID: `transactions`
   - Fields:
     - `servedById` (Ascending)
     - `createdAt` (Descending)
   - Query Scopes: Collection
6. Click "Create"

### Method 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:indexes
```

This will deploy the indexes defined in `firestore.indexes.json`.

### Method 3: Auto-creation via Error Link

When the app first attempts to query with the filter, Firestore will throw an error with a direct link to create the required index. Simply click the link and it will pre-configure the index for you.

## How It Works

- **Admins**: See all transactions (no filtering applied)
- **Attendants**: Only see transactions where `servedById` matches their user ID

The `servedBy` field stores the attendant's display name for UI display, while `servedById` stores the user ID for secure filtering.
