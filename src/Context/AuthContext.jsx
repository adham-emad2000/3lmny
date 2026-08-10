import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const freshData = docSnap.data();
            setUserData(freshData);
            localStorage.setItem("elemny_user_data", JSON.stringify(freshData));
          }
        } catch (error) {
          console.error("Error fetching user data in AuthContext:", error);
        }
      } else {
        setUserData(null);
        localStorage.removeItem("elemny_user_data");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (data) => {
    localStorage.setItem("elemny_user_data", JSON.stringify(data));
    setUserData(data);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("elemny_user_data");
      setUserData(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
