import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";
import { AuthContextProvider } from "./components/context/AuthContext";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Attach stored JWT as Bearer token so the `verify` middleware on the server
// can authenticate requests regardless of whether the httpOnly cookie is forwarded.
axios.interceptors.request.use((config) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${storedUser.accessToken}`;
    }
  } catch (_) {}
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>
);
