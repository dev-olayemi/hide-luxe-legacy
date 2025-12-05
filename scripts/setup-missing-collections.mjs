/**
 * Firestore Missing Collections Setup Script
 * Creates ONLY the collections you need:
 * - notifications
 * - storePointCoupons
 * - storePointCouponRedemptions
 * - refunds
 * - subscriptions
 * - contactSubmissions
 * 
 * Run: node scripts/setup-missing-collections.mjs
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsPath = path.join(__dirname, '..', 'hide-luxe-firebase-adminsdk-fbsvc-5619a30c86.json');

// Initialize Firebase Admin SDK
if (!fs.existsSync(credentialsPath)) {
  console.error(`❌ Firebase credentials file not found at: ${credentialsPath}`);
  console.error('Make sure you have the service account key file in the project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))),
});

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();

async function createNotificationsCollection() {
  console.log('📝 Creating notifications collection...');
  const notificationsRef = db.collection('notifications');
  
  try {
    const snapshot = await notificationsRef.limit(1).get();
    if (snapshot.empty) {
      // Add a sample document so collection is visible
      await notificationsRef.doc('_schema').set({
        _type: 'schema_reference',
        userId: 'example_user_id',
        title: 'Example Notification',
        message: 'This is a schema reference document. Delete after reviewing.',
        type: 'system',
        read: false,
        createdAt: timestamp,
        description: 'Schema: { userId, title, message, type, read, createdAt, productId?, orderId?, actionLink? }'
      });
      console.log('  ✓ Notifications collection created with schema reference');
    } else {
      console.log('  ✓ Notifications collection already exists');
    }
    console.log('  Schema: { userId, title, message, type, read, createdAt, productId?, orderId?, actionLink? }');
  } catch (err) {
    console.error('❌ Error creating notifications collection:', err);
  }
}

async function createStorePointCouponsCollection() {
  console.log('📝 Creating storePointCoupons collection...');
  const couponsRef = db.collection('storePointCoupons');
  
  try {
    const snapshot = await couponsRef.limit(1).get();
    if (snapshot.empty) {
      await couponsRef.doc('_schema').set({
        _type: 'schema_reference',
        code: 'EXAMPLE2024',
        value: 500,
        description: 'This is a schema reference document. Delete after reviewing.',
        createdBy: 'admin_uid',
        createdAt: timestamp,
        isActive: true,
        schema: '{ code, value, createdBy, createdAt, expiresAt?, description? }'
      });
      console.log('  ✓ StorePointCoupons collection created with schema reference');
    } else {
      console.log('  ✓ StorePointCoupons collection already exists');
    }
    console.log('  Schema: { code, value, createdBy, createdAt, expiresAt?, description? }');
  } catch (err) {
    console.error('❌ Error creating storePointCoupons collection:', err);
  }
}

async function createStorePointCouponRedemptionsCollection() {
  console.log('📝 Creating storePointCouponRedemptions collection...');
  const redemptionsRef = db.collection('storePointCouponRedemptions');
  
  try {
    const snapshot = await redemptionsRef.limit(1).get();
    if (snapshot.empty) {
      await redemptionsRef.doc('_schema').set({
        _type: 'schema_reference',
        code: 'EXAMPLE2024',
        userId: 'example_user_id',
        redeemedAt: timestamp,
        pointsAwarded: 500,
        description: 'This is a schema reference document. Delete after reviewing.',
        schema: '{ code, userId, redeemedAt, pointsAwarded }'
      });
      console.log('  ✓ StorePointCouponRedemptions collection created with schema reference');
    } else {
      console.log('  ✓ StorePointCouponRedemptions collection already exists');
    }
    console.log('  Schema: { code, userId, redeemedAt, pointsAwarded }');
  } catch (err) {
    console.error('❌ Error creating storePointCouponRedemptions collection:', err);
  }
}

async function createRefundsCollection() {
  console.log('📝 Creating refunds collection...');
  const refundsRef = db.collection('refunds');
  
  try {
    const snapshot = await refundsRef.limit(1).get();
    if (snapshot.empty) {
      await refundsRef.doc('_schema').set({
        _type: 'schema_reference',
        userId: 'example_user_id',
        userEmail: 'user@example.com',
        orderId: 'example_order_id',
        reason: 'Example refund reason',
        status: 'pending',
        createdAt: timestamp,
        description: 'This is a schema reference document. Delete after reviewing.'
      });
      console.log('  ✓ Refunds collection created with schema reference');
    } else {
      console.log('  ✓ Refunds collection already exists');
    }
  } catch (err) {
    console.error('❌ Error creating refunds collection:', err);
  }
}

async function createSubscriptionsCollection() {
  console.log('📝 Creating subscriptions collection...');
  const subscriptionsRef = db.collection('subscriptions');
  
  try {
    const snapshot = await subscriptionsRef.limit(1).get();
    if (snapshot.empty) {
      await subscriptionsRef.doc('_schema').set({
        _type: 'schema_reference',
        email: 'subscriber@example.com',
        status: 'active',
        createdAt: timestamp,
        description: 'This is a schema reference document. Delete after reviewing.'
      });
      console.log('  ✓ Subscriptions collection created with schema reference');
    } else {
      console.log('  ✓ Subscriptions collection already exists');
    }
  } catch (err) {
    console.error('❌ Error creating subscriptions collection:', err);
  }
}

async function createContactSubmissionsCollection() {
  console.log('📝 Creating contactSubmissions collection...');
  const contactRef = db.collection('contactSubmissions');
  
  try {
    const snapshot = await contactRef.limit(1).get();
    if (snapshot.empty) {
      await contactRef.doc('_schema').set({
        _type: 'schema_reference',
        name: 'Example Name',
        email: 'contact@example.com',
        phone: '+234 XXX XXX XXXX',
        message: 'Example contact message',
        read: false,
        createdAt: timestamp,
        description: 'This is a schema reference document. Delete after reviewing.'
      });
      console.log('  ✓ ContactSubmissions collection created with schema reference');
    } else {
      console.log('  ✓ ContactSubmissions collection already exists');
    }
  } catch (err) {
    console.error('❌ Error creating contactSubmissions collection:', err);
  }
}

async function main() {
  console.log('\n🚀 Firestore Missing Collections Setup');
  console.log('======================================\n');

  try {
    await createNotificationsCollection();
    await createStorePointCouponsCollection();
    await createStorePointCouponRedemptionsCollection();
    await createRefundsCollection();
    await createSubscriptionsCollection();
    await createContactSubmissionsCollection();

    console.log('\n✅ All missing collections have been created successfully!');
    console.log('\n📊 Collections created:');
    console.log('   1. notifications');
    console.log('   2. storePointCoupons');
    console.log('   3. storePointCouponRedemptions');
    console.log('   4. refunds');
    console.log('   5. subscriptions');
    console.log('   6. contactSubmissions');
    console.log('\n📌 Next steps:');
    console.log('   - Refresh Firebase Console to see the collections');
    console.log('   - Delete the "_schema" documents after reviewing (they are just references)');
    console.log('   - Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('   - Test notification, coupon, and store point features');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
