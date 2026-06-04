import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";
import { AuthContextProvider } from "./components/context/AuthContext";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// --- Circuit breaker: stops all API calls when the server is unreachable ---
let serverDown = false;
let retryTimer = null;
const RETRY_AFTER_MS = 30000; // re-probe after 30 s

function markServerDown() {
  if (serverDown) return;
  serverDown = true;
  console.warn("[circuit-breaker] Server unreachable — pausing API calls for 30 s");
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    serverDown = false;
    console.info("[circuit-breaker] Retrying server...");
  }, RETRY_AFTER_MS);
}

// Block outgoing requests when server is down
axios.interceptors.request.use(
  (config) => {
    if (serverDown) {
      return Promise.reject(Object.assign(new Error("Server is currently unreachable"), { __circuitOpen: true }));
    }
    // Attach stored JWT as Bearer token
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${storedUser.accessToken}`;
      }
    } catch (_) {}
    return config;
  }
);

// Detect network failures and trip the circuit breaker
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.__circuitOpen) return Promise.reject(error);
    // Network error (server down / no response) — not a 4xx/5xx from the server
    if (!error.response) {
      markServerDown();
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </React.StrictMode>
);
