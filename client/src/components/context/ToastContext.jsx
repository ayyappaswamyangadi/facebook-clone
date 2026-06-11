import { createContext, useCallback, useContext, useState } from "react";

export const ToastContext = createContext(null);

let _id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  }, []);

  const add = useCallback((message, type, duration) => {
    const id = ++_id;
    const dur = duration ?? (type === "error" ? 5000 : 3500);
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration: dur, exiting: false }]);
    return id;
  }, []);

  const toast = {
    success: (msg, dur) => add(msg, "success", dur),
    error:   (msg, dur) => add(msg, "error",   dur),
    info:    (msg, dur) => add(msg, "info",     dur),
    warning: (msg, dur) => add(msg, "warning",  dur),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, remove }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx.toast;
};
