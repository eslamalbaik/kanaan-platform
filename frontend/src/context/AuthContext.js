import React, { createContext, useState, useContext, useEffect } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("kanaan_user");
    return savedUser ? JSON.parse(savedUser) : null;
});

const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedUser = localStorage.getItem("kanaan_user");
    return !!savedUser; 
});

  useEffect(() => {
    const savedUser = localStorage.getItem("kanaan_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("kanaan_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("kanaan_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);