import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../utils/api.js";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");

    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("USER_PARSE_ERROR", error);
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(getStoredUser);

  function persistAuth(nextToken, nextUser) {
    if (nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem("token");
      setToken("");
    }

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem("user");
      setUser(null);
    }
  }

  async function login(formData) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    persistAuth(data.token || "", data.user || null);
    return data;
  }

  async function register(formData) {
    return await api("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  function logout() {
    persistAuth("", null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      setUser,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}