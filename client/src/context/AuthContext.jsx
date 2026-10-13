import { useState } from "react";

import { registerUser, loginUser } from "../services/authService";

import { AuthContext } from "../hooks/useAuth";

const TOKEN_KEY = "spendwise-token";
const USER_KEY = "spendwise-user";

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  async function register(formData) {
    const result = await registerUser(formData);
    saveSession(result);
    return result;
  }

  async function login(credentials) {
    const result = await loginUser(credentials);
    saveSession(result);
    return result;
  }

  function saveSession(result) {
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));

    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
