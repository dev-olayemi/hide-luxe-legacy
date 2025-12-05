// Store Point Coupons Firestore Model
// Collection: storePointCoupons
// Fields:
//   code: string (unique coupon code)
//   value: number (store points value)
//   createdBy: string (admin uid)
//   createdAt: timestamp
//   redeemedBy: array of user uids (optional, for tracking)
//   expiresAt: timestamp (optional)

// User Redemptions:
// Collection: storePointCouponRedemptions
// Fields:
//   code: string (coupon code)
//   userId: string
//   redeemedAt: timestamp

// This structure allows admin to create coupons, set their value, and track redemptions to prevent reuse.
