import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../src/firebase/firebaseConfig";

export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
