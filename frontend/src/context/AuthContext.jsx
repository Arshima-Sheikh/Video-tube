import React, { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    try {
      const res = await api.get("/api/v1/users/current-user");
      setUser(res.data?.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async ({ username, email, password }) => {
    const payload = username ? { username, password } : { email, password };
    const res = await api.post("/api/v1/users/login", payload);
    const logged = res.data?.data?.user || res.data?.data;
    setUser(logged);
    return res;
  };

  const register = async (formData) => {
    const res = await api.post("/api/v1/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const registered = res.data?.data?.user || res.data?.data;
    setUser(registered);
    return res;
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loadCurrentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};