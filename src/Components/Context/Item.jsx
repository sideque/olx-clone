import { createContext, useContext, useState, useEffect } from "react";
import { fetchFromFirestore, firestore } from "../Firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";

const Context = createContext(null);

export const ItemsContext = () => useContext(Context);

export const ItemsContextProvider = ({ children }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const fetchItemsFromFirestore = async () => {
      try {
        const productsCollection = collection(firestore, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        SetItems(productsList);
      } catch (error) {
        console.log(error, "error fetching products");
      }
    };

    fetchFromFirestore();
  }, []);

  return (
    <>
      <Context.Provider value={{ items, setItems }}>
        {children}
      </Context.Provider>
    </>
  );
};
