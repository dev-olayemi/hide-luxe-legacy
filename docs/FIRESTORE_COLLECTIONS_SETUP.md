# Firestore Collections Setup Guide

This guide explains how to create and manage all Firestore collections for the Hide & Luxe Legacy application.

## Collections Overview

### 1. **users**
Stores user profile information and account data.

**Schema:**
```javascript
{
  uid: string (document ID)
  email: string
  role: "user" | "admin"
  storePoints: number (default: 0)
  createdAt: timestamp
  lastLogin: timestamp
  updatedAt: timestamp
}
```

---

### 2. **products**
Stores product information.

**Schema:**
```javascript
{
  id: string (document ID)
  name: string
  category: string
  price: number
  image: string
  description: string
  inStock: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 3. **categories**
Stores product categories.

**Schema:**
```javascript
{
  id: string (document ID, e.g., 'footwear', 'apparel')
  name: string
  title: string
  description: string
  featured: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 4. **orders**
Stores customer orders.

**Schema:**
```javascript
{
  id: string (document ID)
  userId: string
  userEmail: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
    category: string
  }>
  totalAmount: number
  status: "pending" | "processing" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  deliveryDetails: {
    fullName: string
    phoneNumber: string
    address: string
    city: string
    state: string
    additionalInfo?: string
  }
  storePointsRedeemed: number
  paymentDetails?: {
    transactionId: string
    flwRef: string
    paymentType: string
    paidAt: timestamp
  }
  createdAt: timestamp
  updatedAt: timestamp
  txRef: string
}
```

---

### 5. **carts**
Stores user shopping carts. Document ID = userId.

**Schema:**
```javascript
{
  userId: string
  items: Array<{
    productId: string
    quantity: number
  }>
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 6. **wishlists**
Stores user wishlists. Document ID = userId.

**Schema:**
```javascript
{
  userId: string
  productIds: Array<string>
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 7. **bespokeRequests**
Stores custom/bespoke product requests.

**Schema:**
```javascript
{
  id: string (document ID)
  userId: string
  category: string
  productType: string
  description: string
  specifications?: string
  budget?: string
  timeline?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  images?: Array<string> (URLs)
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 8. **notifications**
Stores system notifications for users.

**Schema:**
```javascript
{
  id: string (document ID)
  userId: string
  title: string
  message: string
  type: "order" | "promotion" | "system" | "custom"
  read: boolean (default: false)
  productId?: string (optional, for product-related notifications)
  orderId?: string (optional, for order-related notifications)
  actionLink?: string (optional, redirect URL)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 9. **storePointCoupons**
Stores store point coupon codes.

**Schema:**
```javascript
{
  code: string (document ID or unique field, e.g., 'SUMMER2024')
  value: number (store points value)
  description?: string
  createdBy: string (admin uid)
  createdAt: timestamp
  expiresAt?: timestamp (optional)
  isActive: boolean (default: true)
}
```

---

### 10. **storePointCouponRedemptions**
Tracks coupon usage to prevent duplicate redemptions.

**Schema:**
```javascript
{
  id: string (document ID, auto-generated)
  code: string
  userId: string
  redeemedAt: timestamp
  pointsAwarded: number
}
```

**Index:** Create a composite index on `(code, userId)` for faster lookups.

---

### 11. **refunds**
Stores refund requests.

**Schema:**
```javascript
{
  id: string (document ID)
  userId: string
  userEmail: string
  orderId: string
  reason: string
  status: "pending" | "approved" | "rejected" | "processed"
  bankDetails: {
    bankName: string
    accountName: string
    accountNumber: string
  }
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

### 12. **subscriptions**
Stores email subscriptions.

**Schema:**
```javascript
{
  id: string (document ID)
  email: string
  status: "active" | "inactive"
  createdAt: timestamp
  unsubscribedAt?: timestamp
}
```

---

### 13. **contactSubmissions**
Stores contact form submissions.

**Schema:**
```javascript
{
  id: string (document ID)
  name: string
  email: string
  phone: string
  message: string
  read: boolean (default: false)
  createdAt: timestamp
}
```

---

## Setup Instructions

### Step 1: Run the Setup Script

```bash
# Using Node.js
node scripts/setup-firestore-collections.mjs

# Or using npm script (if added to package.json)
npm run setup:firestore
```

**Requirements:**
- Firebase Admin SDK credentials file: `hide-luxe-firebase-adminsdk-fbsvc-5619a30c86.json` (must be in project root)
- Node.js 14+ installed

### Step 2: Import Products and Categories

```bash
# Run the product import script
node scripts/run-import-admin.mjs

# Or use the admin UI to manually import
```

### Step 3: Deploy Firestore Security Rules

```bash
# Deploy rules
firebase deploy --only firestore:rules

# View deployed rules
firebase firestore:indexes
```

### Step 4: Create Firestore Indexes (if needed)

For the `storePointCouponRedemptions` collection, create a composite index:
- Fields: `code` (Ascending), `userId` (Ascending)
- Collection: `storePointCouponRedemptions`

You can create this via Firebase Console or it will be auto-created on first query.

---

## Collection-Specific Operations

### Users Collection
- Auto-created when users sign up via Firebase Auth
- Updated on login (lastLogin timestamp)
- Updated when admin changes user details (storePoints, role)

### Store Point Coupons
```javascript
// Create a coupon (Admin only)
db.collection('storePointCoupons').doc('SUMMER2024').set({
  code: 'SUMMER2024',
  value: 500, // 500 points = ₦5,000
  description: 'Summer promotion',
  createdBy: adminUid,
  createdAt: FieldValue.serverTimestamp(),
  expiresAt: new Date('2024-08-31'),
  isActive: true
});

// Check if user has redeemed coupon
const existing = await db.collection('storePointCouponRedemptions')
  .where('code', '==', 'SUMMER2024')
  .where('userId', '==', userUid)
  .get();

if (existing.empty) {
  // User hasn't used this coupon, allow redemption
  // Add points to user
  await db.collection('users').doc(userUid).update({
    storePoints: FieldValue.increment(coupon.value)
  });
  
  // Record redemption
  await db.collection('storePointCouponRedemptions').add({
    code: 'SUMMER2024',
    userId: userUid,
    redeemedAt: FieldValue.serverTimestamp(),
    pointsAwarded: coupon.value
  });
}
```

### Notifications
```javascript
// Send notification to user (Admin)
await db.collection('notifications').add({
  userId: userUid,
  title: 'Order Shipped',
  message: 'Your order has been shipped!',
  type: 'order',
  read: false,
  orderId: orderId,
  createdAt: FieldValue.serverTimestamp()
});

// Mark notification as read (User)
await db.collection('notifications').doc(notificationId).update({
  read: true
});
```

---

## Firestore Rules

Key rules for these collections:

```firestore
// Notifications: users can read their own, admins can manage all
match /notifications/{notificationId} {
  allow get: if request.auth != null && 
    (request.auth.uid == resource.data.userId || isAdmin());
  allow list: if request.auth != null && 
    (isAdmin() || request.query.where('userId','==', request.auth.uid));
  allow create, update: if isAdmin();
  allow delete: if request.auth != null && 
    (request.auth.uid == resource.data.userId || isAdmin());
}

// Store Point Coupons: read-only for users, write for admins
match /storePointCoupons/{couponId} {
  allow get, list: if request.auth != null;
  allow create, update, delete: if isAdmin();
}

// Store Point Coupon Redemptions: users can write their own, all can read
match /storePointCouponRedemptions/{redemptionId} {
  allow get, list: if request.auth != null;
  allow create: if request.auth != null && 
    request.resource.data.userId == request.auth.uid;
}
```

---

## Troubleshooting

### Collections Not Appearing in Firebase Console
- Firestore collections are created when the first document is added
- If no data exists, collections may not be visible in the console
- Use the setup script to initialize all collections

### Permission Denied Errors
- Ensure Firestore security rules are properly deployed
- Check that user has appropriate role (user/admin)
- Verify custom claims are set correctly

### Coupon Redemption Issues
- Ensure `storePointCouponRedemptions` collection exists
- Check for duplicate redemption records
- Verify user hasn't already redeemed the coupon

---

## Next Steps

1. ✅ Run `node scripts/setup-firestore-collections.mjs`
2. ✅ Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. ✅ Import products: `node scripts/run-import-admin.mjs`
4. ✅ Test notifications, coupons, and store points features
5. ✅ Monitor Firestore usage in Firebase Console

---

## References

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
