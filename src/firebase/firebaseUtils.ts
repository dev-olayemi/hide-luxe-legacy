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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getProductById(productId: string) {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    return productDoc.exists()
      ? { id: productDoc.id, ...productDoc.data() }
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

export {
  signup,
  login,
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
  uploadImage,
  auth,
  db,
  storage,
};

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
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
