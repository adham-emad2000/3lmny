import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  // دالة لتحديث الداتا في اللوكال ستوريدج والـ State مع بعض فوراً
  const login = (data) => {
    localStorage.setItem("elemny_user_data", JSON.stringify(data));
    setUserData(data);
  };

  const logout = () => {
    localStorage.removeItem("elemny_user_data");
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
