import { onAuthStateChanged } from "firebase/auth";
import {
  children,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../Firebase/Firebase";

const Authcontext = createContext(null);
export const UserAuth = () => useContext(Authcontext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed: ", currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Authcontext.Provider value={{ user }}>{children}</Authcontext.Provider>
  );
};
