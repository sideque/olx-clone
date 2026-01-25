import { initializeApp } from "firebase/app";
import { getAuth, signOut, GoogleAuthProvider } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZcCYW47X24OCYJXFYZSvAKysVX1JPz9M",
  authDomain: "olx-clone-81cda.firebaseapp.com",
  projectId: "olx-clone-81cda",
  storageBucket: "olx-clone-81cda.firebasestorage.app",
  messagingSenderId: "107953883664",
  appId: "1:107953883664:web:e3c05dd3abdb4d74e15895",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
const firestore = getFirestore(app);

// Fetch products
const fetchFromFirestore = async () => {
  try {
    const productsCollection = collection(firestore, "products");
    const productSnapshot = await getDocs(productsCollection);
    const productList = productSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched products from Firestore", productList);
    return productList;
  } catch (error) {
    console.error("Error fetching products from Firestore: ", error);
    return [];
  }
};

// Logout
const logout = () => {
  signOut(auth);
};

export { auth, provider, storage, firestore, logout, fetchFromFirestore };
