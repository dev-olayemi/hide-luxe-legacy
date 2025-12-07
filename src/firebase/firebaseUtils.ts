/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CartItem } from "@/contexts/CartContext";
import { db, auth, app } from "./firebaseConfig";

// Initialize storage
const storage = getStorage(app);

// User Operations
async function signup(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      role: "user",
      createdAt: new Date(),
      lastLogin: new Date(),
    });
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateDoc(doc(db, "users", user.uid), { lastLogin: new Date() });
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Google Sign-in (popup)
async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // ensure user record exists in Firestore
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          role: "user",
          storePoints: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "users", user.uid), { lastLogin: serverTimestamp() });
      }
    } catch (e) {
      console.warn("Failed to ensure user doc after Google sign-in", e);
    }

    return user;
  } catch (error: any) {
    console.error("Google sign-in failed", error);
    throw error;
  }
}

async function getUserProfile(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateUserProfile(uid: string, updates: any) {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Product Operations
async function addProduct(productData: any) {
  try {
    if (!auth.currentUser) throw new Error("You must be logged in");
    await addDoc(collection(db, "products"), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllProducts() {
  try {
    const q = query(collection(db, "products"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getProductById(productId: string) {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    return productDoc.exists()
      ? { ...(productDoc.data() as any), id: productDoc.id }
      : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateProduct(productId: string, updates: any) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await updateDoc(doc(db, "products", productId), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function deleteProduct(productId: string) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await deleteDoc(doc(db, "products", productId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getProductsByCategory(category: string) {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as any), id: doc.id }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Category Operations
async function addCategory(categoryData: any) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await addDoc(collection(db, "categories"), {
      ...categoryData,
      createdAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getAllCategories() {
  try {
    const q = query(collection(db, "categories"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateCategory(categoryId: string, updates: any) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await updateDoc(doc(db, "categories", categoryId), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function deleteCategory(categoryId: string) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await deleteDoc(doc(db, "categories", categoryId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Cart Operations
// (removed duplicate firebase/firestore import and fixed addToCart to accept array or single item)

// Helper: remove undefined and nested arrays from an object
const sanitizeItem = (item: any) => {
  const out: Record<string, any> = {};
  if (!item || typeof item !== "object") return item;
  Object.entries(item).forEach(([k, v]) => {
    if (v === undefined) return; // drop undefined
    if (Array.isArray(v)) {
      // omit nested arrays to avoid Firestore nested-array error
      return;
    }
    if (v !== null && typeof v === "object") {
      out[k] = sanitizeItem(v);
    } else {
      out[k] = v;
    }
  });
  return out;
};

const addToCart = async (userId: string, itemOrItems: any | any[]) => {
  if (!userId) throw new Error("Missing userId");
  const cartRef = doc(db, "carts", userId);

  const itemsArray = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

  // Convert each incoming item into a minimal safe object
  const sanitizedItems = itemsArray
    .map((item) => {
      const base = {
        id: item?.id ?? "",
        name: item?.name ?? "",
        price:
          typeof item?.price === "number"
            ? item.price
            : Number(item?.price || 0),
        quantity:
          typeof item?.quantity === "number"
            ? item.quantity
            : Number(item?.quantity || 1),
        image: item?.image ?? "",
        category: item?.category ?? "",
        // add other primitive fields here if needed
      };
      return sanitizeItem(base);
    })
    .filter(Boolean);

  if (sanitizedItems.length === 0) {
    throw new Error("No valid items to add to cart");
  }

  try {
    // Use arrayUnion with spread so multiple items get appended safely
    await updateDoc(cartRef, {
      items: arrayUnion(...sanitizedItems),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    // fallback: create or merge cart doc
    try {
      await setDoc(
        cartRef,
        {
          items: sanitizedItems,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (inner) {
      console.error("Error adding to cart:", inner);
      throw inner;
    }
  }
};

async function getCart(userId: string) {
  try {
    const cartDoc = await getDoc(doc(db, "carts", userId));
    return cartDoc.exists()
      ? cartDoc.data()
      : { items: [], userId, updatedAt: new Date() };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateCart(userId: string, items: any[]) {
  try {
    await setDoc(
      doc(db, "carts", userId),
      { userId, items, updatedAt: new Date() },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Shared cart snapshots (for seller viewing across devices)
async function saveSharedCartSnapshot(cartId: string, payload: any) {
  try {
    if (!cartId) throw new Error("Missing cartId");
    const ref = doc(db, "sharedCarts", cartId);
    await setDoc(
      ref,
      {
        ...payload,
        updatedAt: serverTimestamp(),
        createdAt: payload.createdAt ? payload.createdAt : serverTimestamp(),
      },
      { merge: true }
    );
    return cartId;
  } catch (error: any) {
    console.error("Error saving shared cart snapshot:", error);
    throw error;
  }
}

async function getSharedCartSnapshot(cartId: string) {
  try {
    if (!cartId) return null;
    const snap = await getDoc(doc(db, "sharedCarts", cartId));
    return snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null;
  } catch (error: any) {
    console.error("Error fetching shared cart snapshot:", error);
    throw error;
  }
}

async function clearCart(userId: string) {
  try {
    await setDoc(
      doc(db, "carts", userId),
      { userId, items: [], updatedAt: new Date() },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Wishlist Operations
async function addToWishlist(userId: string, productId: string) {
  try {
    const wishlistRef = doc(db, "wishlists", userId);
    const wishlist = await getDoc(wishlistRef);
    const productIds = wishlist.exists() ? wishlist.data().productIds : [];
    if (!productIds.includes(productId)) productIds.push(productId);
    await setDoc(
      wishlistRef,
      { userId, productIds, updatedAt: new Date() },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getWishlist(userId: string) {
  try {
    const wishlistDoc = await getDoc(doc(db, "wishlists", userId));
    return wishlistDoc.exists()
      ? wishlistDoc.data()
      : { userId, productIds: [], updatedAt: new Date() };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function removeFromWishlist(userId: string, productId: string) {
  try {
    const wishlistDoc = await getDoc(doc(db, "wishlists", userId));
    if (wishlistDoc.exists()) {
      const productIds = wishlistDoc
        .data()
        .productIds.filter((id: string) => id !== productId);
      await setDoc(
        doc(db, "wishlists", userId),
        { userId, productIds, updatedAt: new Date() },
        { merge: true }
      );
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function clearWishlist(userId: string) {
  try {
    await setDoc(
      doc(db, "wishlists", userId),
      { userId, productIds: [], updatedAt: new Date() },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Order Operations
const createOrder = async (orderData: {
  userId: string;
  items: any[];
  totalAmount: number;
  status?: string;
}) => {
  try {
    const ordersRef = collection(db, "orders");
    const newOrder = {
      ...orderData,
      status: orderData.status || "pending",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, newOrder);
    return { id: docRef.id, ...newOrder };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

const updateOrder = async (orderId: string, data: Partial<Order>) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

const getOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(), // Convert Firestore Timestamp
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Admin: fetch all orders (used for searching/attaching orders in admin UI)
async function getAllOrders() {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  } catch (error: any) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

const getBespokeRequests = async (userId: string) => {
  try {
    const bespokeRef = collection(db, "bespokeRequests");
    const q = query(
      bespokeRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(), // Convert Firestore Timestamp
    }));
  } catch (error) {
    console.error("Error fetching bespoke requests:", error);
    return [];
  }
};

const getAllBespokeRequests = async () => {
  try {
    const snap = await getDocs(collection(db, "bespokeRequests"));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
      };
    });
  } catch (err) {
    console.error("Error fetching all bespoke requests:", err);
    return [];
  }
};

const updateBespokeRequest = async (id: string, updates: any) => {
  try {
    const ref = doc(db, "bespokeRequests", id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error updating bespoke request:", err);
    throw err;
  }
};

// Refund Operations
const createRefund = async (refundData: any) => {
  try {
    const refundsRef = collection(db, "refunds");
    const newRefund = {
      ...refundData,
      status: refundData.status || "pending",
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(refundsRef, newRefund);
    return { id: docRef.id, ...newRefund };
  } catch (err) {
    console.error("Error creating refund:", err);
    throw err;
  }
};

const getRefunds = async (userId: string) => {
  try {
    const refundsRef = collection(db, "refunds");
    const q = query(refundsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any), createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt }));
  } catch (err) {
    console.error("Error fetching refunds:", err);
    return [];
  }
};

const updateRefund = async (refundId: string, updates: any) => {
  try {
    const ref = doc(db, "refunds", refundId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error("Error updating refund:", err);
    throw err;
  }
};

// Image Upload (for Products)
async function uploadImage(file: File) {
  try {
    const storageRef = ref(storage, `products/${file.name}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Auth State Listener (for guest sync)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Sync local storage cart/wishlist to DB on login
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (localCart.length > 0) {
      addToCart(user.uid, localCart);
      localStorage.removeItem("cart");
    }
    const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (localWishlist.length > 0) {
      localWishlist.forEach((productId: string) =>
        addToWishlist(user.uid, productId)
      );
      localStorage.removeItem("wishlist");
    }
  }
});

// ===== NOTIFICATION OPERATIONS =====

interface Notification {
  id?: string;
  userId: string;
  type: "order" | "refund" | "bespoke" | "payment" | "system" | "admin";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: any;
  updatedAt?: any;
  metadata?: Record<string, any>;
}

export async function createNotification(notification: Omit<Notification, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw new Error(error.message);
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (Notification & { id: string })[];
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// Admin helper: fetch all notifications (for admin management)
export async function getAllNotifications() {
  try {
    const snap = await getDocs(collection(db, "notifications"));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.message);
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    throw new Error(error.message);
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error("Error clearing notifications:", error);
    throw new Error(error.message);
  }
}

export async function sendAdminMessage(userId: string, message: string, title?: string) {
  try {
    const notificationId = await createNotification({
      userId,
      type: "admin",
      title: title || "Message from Hide Luxe",
      message,
      read: false,
    });
    return notificationId;
  } catch (error: any) {
    console.error("Error sending admin message:", error);
    throw new Error(error.message);
  }
}

export {
  signup,
  login,
  signInWithGoogle,
  getUserProfile,
  updateUserProfile,
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  addToCart,
  getCart,
  updateCart,
  clearCart,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  createOrder,
  updateOrder,
  getOrders,
  getBespokeRequests,
  getAllBespokeRequests,
  updateBespokeRequest,
  createRefund,
  getRefunds,
  updateRefund,
  uploadImage,
  saveSharedCartSnapshot,
  getSharedCartSnapshot,
  auth,
  db,
  storage,
  setUserStorePoints,
};

export { getAllOrders };

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}

// Store Points Operations
async function setUserStorePoints(uid: string, points: number) {
  try {
    await updateDoc(doc(db, "users", uid), {
      storePoints: points,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Alias for clarity: updateUserStorePoints -> setUserStorePoints
export const updateUserStorePoints = setUserStorePoints;

// Store Point Coupons Operations
export async function createStorePointCoupon(
  code: string,
  value: number,
  adminUid: string,
  description?: string,
  expiresAt?: Date
) {
  try {
    const couponCode = code.toUpperCase().trim();
    if (!couponCode || value <= 0) {
      throw new Error("Invalid coupon code or value");
    }

    await setDoc(doc(db, "storePointCoupons", couponCode), {
      code: couponCode,
      value: value,
      createdBy: adminUid,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      description: description || "",
      isActive: true,
    });
    
    // After creating the coupon, send a notification to all users informing them
    // about the new coupon code. This is best-effort: failures here should not
    // prevent the coupon from being created.
    try {
      const users = await getAllUsers();
      const notifPromises: Promise<any>[] = [];
      const title = "New Store Point Coupon";
      const message = `A new coupon ${couponCode} is available — redeem for ${value} pts.`;

      users.forEach((u: any) => {
        // skip if no uid
        if (!u?.uid) return;
        notifPromises.push(
          createNotification({
            userId: u.uid,
            type: "admin",
            title,
            message,
            actionUrl: "/account",
            actionLabel: "Redeem",
            read: false,
            metadata: { couponCode, points: value },
          })
        );
      });

      // run in parallel but don't fail the main operation if some notifications fail
      await Promise.allSettled(notifPromises);
    } catch (notifErr) {
      console.warn("Failed to create notifications for new coupon:", notifErr);
    }

    return { success: true, code: couponCode };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllStorePointCoupons() {
  try {
    const q = query(collection(db, "storePointCoupons"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
    }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getStorePointCoupon(code: string) {
  try {
    const couponCode = code.toUpperCase().trim();
    const docRef = doc(db, "storePointCoupons", couponCode);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        expiresAt: data.expiresAt?.toDate?.() || data.expiresAt,
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateStorePointCoupon(
  code: string,
  updates: any
) {
  try {
    const couponCode = code.toUpperCase().trim();
    await updateDoc(doc(db, "storePointCoupons", couponCode), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteStorePointCoupon(code: string) {
  try {
    const couponCode = code.toUpperCase().trim();
    await deleteDoc(doc(db, "storePointCoupons", couponCode));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function checkCouponRedemption(code: string, userId: string) {
  try {
    const couponCode = code.toUpperCase().trim();
    const q = query(
      collection(db, "storePointCouponRedemptions"),
      where("code", "==", couponCode),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty; // true if already redeemed
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function redeemStorePointCoupon(code: string, userId: string) {
  try {
    const couponCode = code.toUpperCase().trim();

    // Check if coupon exists
    const coupon = await getStorePointCoupon(couponCode);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      throw new Error("Coupon is not active");
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error("Coupon has expired");
    }

    // Check if user already redeemed this coupon
    const alreadyRedeemed = await checkCouponRedemption(couponCode, userId);
    if (alreadyRedeemed) {
      throw new Error("You have already redeemed this coupon");
    }

    // Add points to user
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const currentPoints = userSnap.data().storePoints || 0;
    const newPoints = currentPoints + coupon.value;

    await updateDoc(userRef, {
      storePoints: newPoints,
      updatedAt: new Date(),
    });

    // Record redemption
    await addDoc(collection(db, "storePointCouponRedemptions"), {
      code: couponCode,
      userId: userId,
      redeemedAt: serverTimestamp(),
      pointsAwarded: coupon.value,
    });

    return { success: true, pointsAwarded: coupon.value, newTotal: newPoints };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ===== COLLECTIONS MANAGEMENT =====

export interface CollectionItem {
  id?: string;
  name: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  featured?: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export async function getAllCollections(): Promise<CollectionItem[]> {
  try {
    const snap = await getDocs(collection(db, "collections"));
    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as CollectionItem));
    // Sort by order field
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return items;
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export async function createCollection(
  collectionData: Omit<CollectionItem, "id" | "createdAt" | "updatedAt">
): Promise<CollectionItem> {
  try {
    const docRef = await addDoc(collection(db, "collections"), {
      ...collectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...collectionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

export async function updateCollection(
  collectionId: string,
  updates: Partial<CollectionItem>
): Promise<void> {
  try {
    await updateDoc(doc(db, "collections", collectionId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error updating collection:", error);
    throw error;
  }
}

export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "collections", collectionId));
  } catch (error: any) {
    console.error("Error deleting collection:", error);
    throw error;
  }
}

// ===== CONTACT SUBMISSIONS MANAGEMENT =====

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt?: any;
  respondedAt?: any;
  adminNotes?: string;
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'contactSubmissions'),
        orderBy('createdAt', 'desc')
      )
    );
    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ContactSubmission));
    return items;
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }
}

export async function getContactSubmission(submissionId: string): Promise<ContactSubmission | null> {
  try {
    const docSnap = await getDoc(doc(db, 'contactSubmissions', submissionId));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as ContactSubmission;
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching contact submission:', error);
    return null;
  }
}

export async function updateContactSubmission(
  submissionId: string,
  updates: Partial<ContactSubmission>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'contactSubmissions', submissionId), {
      ...updates,
      respondedAt: updates.status === 'replied' ? serverTimestamp() : undefined,
    });
  } catch (error: any) {
    console.error('Error updating contact submission:', error);
    throw error;
  }
}

export async function deleteContactSubmission(submissionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contactSubmissions', submissionId));
  } catch (error: any) {
    console.error('Error deleting contact submission:', error);
    throw error;
  }
}

export async function markContactAsRead(submissionId: string): Promise<void> {
  try {
    await updateContactSubmission(submissionId, { status: 'read' });
  } catch (error: any) {
    console.error('Error marking contact as read:', error);
    throw error;
  }
}

export async function markContactAsReplied(
  submissionId: string,
  adminNotes: string
): Promise<void> {
  try {
    await updateContactSubmission(submissionId, {
      status: 'replied',
      adminNotes,
    });
  } catch (error: any) {
    console.error('Error marking contact as replied:', error);
    throw error;
  }
}

export async function getUnreadContactCount(): Promise<number> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'contactSubmissions'),
        where('status', '==', 'unread')
      )
    );
    return snap.size;
  } catch (error: any) {
    console.error('Error getting unread contact count:', error);
    return 0;
  }
}

// Type definitions
interface DeliveryDetails {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  additionalInfo?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface Order {
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryDetails: DeliveryDetails;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentDetails?: {
    transactionId: string;
    flwRef: string;
    paymentType: string;
    paidAt: Date;
  };
  createdAt: any;
  updatedAt: any;
  txRef: string;
}
