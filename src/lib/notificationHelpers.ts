/**
 * NOTIFICATION INTEGRATION GUIDE
 * 
 * This file shows examples of how to trigger notifications
 * for various events in your system.
 */

import { createNotification } from "@/firebase/firebaseUtils";

// ===== ORDER SUCCESS NOTIFICATION =====
export const sendOrderSuccessNotification = async (
  userId: string,
  orderId: string,
  totalAmount: number,
  itemCount: number
) => {
  try {
    await createNotification({
      userId,
      type: "order",
      title: "Order Confirmed! ✅",
      message: `Your order #${orderId.slice(0, 8).toUpperCase()} for ₦${totalAmount.toLocaleString()} with ${itemCount} item(s) has been placed successfully.`,
      actionUrl: `/dashboard`,
      actionLabel: "View Order",
      read: false,
      metadata: {
        orderId,
        totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Error sending order success notification:", error);
  }
};

// ===== ORDER STATUS UPDATE NOTIFICATION =====
export const sendOrderStatusNotification = async (
  userId: string,
  orderId: string,
  status: "processing" | "completed" | "cancelled",
  message?: string
) => {
  const statusMessages = {
    processing: `Your order is being prepared! We'll ship it out soon.`,
    completed: `Your order has been completed and is ready for pickup or delivery.`,
    cancelled: `Your order has been cancelled. You can submit a refund request on your dashboard.`,
  };

  try {
    await createNotification({
      userId,
      type: "order",
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: message || statusMessages[status],
      actionUrl: `/dashboard`,
      actionLabel: "View Details",
      read: false,
      metadata: {
        orderId,
        status,
      },
    });
  } catch (error) {
    console.error("Error sending order status notification:", error);
  }
};

// ===== PAYMENT SUCCESS NOTIFICATION =====
export const sendPaymentSuccessNotification = async (
  userId: string,
  orderId: string,
  amount: number,
  transactionId: string
) => {
  try {
    await createNotification({
      userId,
      type: "payment",
      title: "Payment Received! 💰",
      message: `Payment of ₦${amount.toLocaleString()} for order #${orderId.slice(0, 8).toUpperCase()} has been confirmed. Transaction ID: ${transactionId}`,
      actionUrl: `/dashboard`,
      actionLabel: "View Order",
      read: false,
      metadata: {
        orderId,
        amount,
        transactionId,
      },
    });
  } catch (error) {
    console.error("Error sending payment notification:", error);
  }
};

// ===== REFUND REQUEST NOTIFICATION =====
export const sendRefundRequestNotification = async (
  userId: string,
  orderId: string,
  reason: string
) => {
  try {
    await createNotification({
      userId,
      type: "refund",
      title: "Refund Request Submitted",
      message: `Your refund request for order #${orderId.slice(0, 8).toUpperCase()} has been submitted. Reason: ${reason}. We'll review and process it within 3-5 business days.`,
      actionUrl: `/dashboard`,
      actionLabel: "Track Refund",
      read: false,
      metadata: {
        orderId,
        reason,
      },
    });
  } catch (error) {
    console.error("Error sending refund notification:", error);
  }
};

// ===== REFUND APPROVED NOTIFICATION =====
export const sendRefundApprovedNotification = async (
  userId: string,
  orderId: string,
  refundAmount: number
) => {
  try {
    await createNotification({
      userId,
      type: "refund",
      title: "Refund Approved ✅",
      message: `Your refund of ₦${refundAmount.toLocaleString()} for order #${orderId.slice(0, 8).toUpperCase()} has been approved. The amount will be credited to your account within 2-3 business days.`,
      actionUrl: `/dashboard`,
      actionLabel: "View Details",
      read: false,
      metadata: {
        orderId,
        refundAmount,
      },
    });
  } catch (error) {
    console.error("Error sending refund approved notification:", error);
  }
};

// ===== BESPOKE REQUEST SUBMITTED NOTIFICATION =====
export const sendBespokeSubmittedNotification = async (
  userId: string,
  requestId: string,
  productType: string
) => {
  try {
    await createNotification({
      userId,
      type: "bespoke",
      title: "Bespoke Request Received! 🎨",
      message: `Your custom ${productType} request has been submitted successfully. Our team will review it and contact you soon to discuss the details and timeline.`,
      actionUrl: `/dashboard`,
      actionLabel: "Track Request",
      read: false,
      metadata: {
        requestId,
        productType,
      },
    });
  } catch (error) {
    console.error("Error sending bespoke notification:", error);
  }
};

// ===== BESPOKE REQUEST APPROVED NOTIFICATION =====
export const sendBespokeApprovedNotification = async (
  userId: string,
  requestId: string,
  productType: string,
  estimatedCompletion: string
) => {
  try {
    await createNotification({
      userId,
      type: "bespoke",
      title: "Bespoke Request Approved! ✅",
      message: `Your custom ${productType} request has been approved! Estimated completion: ${estimatedCompletion}. We'll keep you updated on the progress.`,
      actionUrl: `/dashboard`,
      actionLabel: "View Details",
      read: false,
      metadata: {
        requestId,
        productType,
        estimatedCompletion,
      },
    });
  } catch (error) {
    console.error("Error sending bespoke approved notification:", error);
  }
};

// ===== BESPOKE REQUEST READY NOTIFICATION =====
export const sendBespokeReadyNotification = async (
  userId: string,
  requestId: string,
  productType: string
) => {
  try {
    await createNotification({
      userId,
      type: "bespoke",
      title: "Your Bespoke Order is Ready! 🎉",
      message: `Your custom ${productType} is now ready for pickup or delivery. Contact us to arrange collection.`,
      actionUrl: `/dashboard`,
      actionLabel: "Contact Us",
      read: false,
      metadata: {
        requestId,
        productType,
      },
    });
  } catch (error) {
    console.error("Error sending bespoke ready notification:", error);
  }
};

// ===== SYSTEM ANNOUNCEMENT / PROMO NOTIFICATION =====
export const sendSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) => {
  try {
    await createNotification({
      userId,
      type: "system",
      title,
      message,
      actionUrl,
      actionLabel: actionUrl ? "Learn More" : undefined,
      read: false,
    });
  } catch (error) {
    console.error("Error sending system notification:", error);
  }
};

// ===== BROADCAST NOTIFICATION TO ALL USERS =====
export const sendBroadcastNotification = async (
  userIds: string[],
  title: string,
  message: string,
  type: "system" | "admin" = "system",
  actionUrl?: string
) => {
  try {
    const promises = userIds.map((userId) =>
      createNotification({
        userId,
        type,
        title,
        message,
        actionUrl,
        actionLabel: actionUrl ? "View" : undefined,
        read: false,
      })
    );
    await Promise.all(promises);
    console.log(`Broadcast notification sent to ${userIds.length} users`);
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
  }
};

/**
 * IMPLEMENTATION EXAMPLES
 * 
 * 1. IN Cart.tsx - AFTER SUCCESSFUL PAYMENT:
 *    
 *    const handlePaymentSuccess = async (response: any) => {
 *      // ... existing payment logic ...
 *      
 *      // Send order success notification
 *      await sendOrderSuccessNotification(
 *        auth.currentUser!.uid,
 *        order.id,
 *        totalAmount,
 *        cartItems.length
 *      );
 *    };
 * 
 * 2. IN Dashboard.tsx - WHEN SUBMITTING CANCEL ORDER:
 *    
 *    const submitCancelOrder = async () => {
 *      // ... existing cancel logic ...
 *      
 *      // Send cancellation notification
 *      await sendOrderStatusNotification(
 *        auth.currentUser!.uid,
 *        cancelForm.orderId,
 *        "cancelled",
 *        "Your order has been cancelled per your request."
 *      );
 *    };
 * 
 * 3. IN Bespoke.tsx - AFTER SUBMISSION:
 *    
 *    const handleSubmit = async (e: React.FormEvent) => {
 *      // ... existing submit logic ...
 *      
 *      // Send bespoke notification
 *      await sendBespokeSubmittedNotification(
 *        auth.currentUser!.uid,
 *        docRef.id,
 *        formData.productType
 *      );
 *    };
 * 
 * 4. ADMIN - IN AdminMessaging or elsewhere:
 *    
 *    const approveRefund = async (refund: any) => {
 *      // ... admin approval logic ...
 *      
 *      // Notify user of approval
 *      await sendRefundApprovedNotification(
 *        refund.userId,
 *        refund.orderId,
 *        parseFloat(refund.estimatedAmount || 0)
 *      );
 *    };
 */
