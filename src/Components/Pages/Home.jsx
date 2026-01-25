import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import Login from "../Modal/Login";
import Sell from "../Modal/Sell";
import Card from "../Card/Card";
import { ItemsContext } from "../Context/Item";
import { fetchFromFirestore } from "../Firebase/Firebase";
import Footer from "../Footer/Footer";
import { auth } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Home = () => {
  const [u] = useAuthState(auth);

  if (u) {
    console.log(u.displayName);
  }

  const [openModal, setModal] = useState(false);
  const [openModalSell, setModalSell] = useState(false);
  const toggleModal = () => {
    setModal(!openModal);
  };
  const toggleModalSell = () => {
    setModalSell(!openModalSell);
  };

  const itemsContext = ItemsContext();

  useEffect(() => {
    const getItems = async () => {
      const datas = await fetchFromFirestore();
      itemsContext?.setItems(datas);
    };
    getItems();
  }, []);

  useEffect(() => {
    console.log("Updated Items:", itemsContext.items);
  }, [itemsContext.items]);

  return (
    <div>
      <Navbar toggleModal={toggleModal} toggleModalSell={toggleModalSell} />
      <Login toggleModal={toggleModal} status={openModal} />
      <Sell
        setItems={itemsContext.setItems}
        toggleModalSell={toggleModalSell}
        status={openModalSell}
      />

      <Card items={itemsContext.items || []} />

      <Footer />
    </div>
  );
};

export default Home;
