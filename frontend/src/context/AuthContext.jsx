import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

function readSavedUser() {
  try {
    const raw = localStorage.getItem("dona_user");
    return raw && localStorage.getItem("dona_token") ? JSON.parse(raw) : null;
  } catch (error) {
    localStorage.removeItem("dona_user");
    localStorage.removeItem("dona_token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("dona_token", data.token);
    localStorage.setItem("dona_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("dona_token", data.token);
    localStorage.setItem("dona_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("dona_token");
    localStorage.removeItem("dona_user");
    setUser(null);
  }

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("dona-session-expired", expired);
    if (localStorage.getItem("dona_token"))
      api
        .get("/auth/me")
        .then(({ data }) => {
          setUser(data.user);
          localStorage.setItem("dona_user", JSON.stringify(data.user));
        })
        .catch(() => {});
    return () => window.removeEventListener("dona-session-expired", expired);
  }, []);
  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
