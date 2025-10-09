/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
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
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase Configuration (Replace with your own from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyABtJcFymrh6MwLqr3NC6ytdAs5Da36n2I",
  authDomain: "hide-luxe.firebaseapp.com",
  projectId: "hide-luxe",
  storageBucket: "hide-luxe.appspot.com",
  messagingSenderId: "182094958607",
  appId: "1:182094958607:web:288036767a37ea338c537a",
  measurementId: "G-CB2L81WCN4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
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
async function addToCart(userId: string, item: any) {
  try {
    const cartRef = doc(db, "carts", userId);
    const cart = await getDoc(cartRef);
    const items = cart.exists() ? cart.data().items : [];
    items.push(item);
    await setDoc(
      cartRef,
      { userId, items, updatedAt: new Date() },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
}

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
async function createOrder(orderData: any) {
  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: new Date(),
      status: "pending",
    });
    const message = `Hello, kindly confirm this order for me. I want to make payment. Cart details: ${orderData.items
      .map((i: any) => `${i.productName}: ${i.quantity} x ${i.price}`)
      .join(", ")}, Total: ${orderData.totalAmount}. Order ID: ${orderRef.id}`;
    window.location.href = `https://wa.me/+2348144977227?text=${encodeURIComponent(
      message
    )}`;
    return orderRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function getOrders(userId: string) {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function updateOrder(orderId: string, updates: any) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await updateDoc(doc(db, "orders", orderId), {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function deleteOrder(orderId: string) {
  try {
    const userRole = (await getUserProfile(auth.currentUser!.uid)).role;
    if (userRole !== "admin") throw new Error("Admin access required");
    await deleteDoc(doc(db, "orders", orderId));
  } catch (error: any) {
    throw new Error(error.message);
  }
}

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
  getOrders,
  updateOrder,
  deleteOrder,
  uploadImage,
  auth,
  db,
  storage,
};

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
