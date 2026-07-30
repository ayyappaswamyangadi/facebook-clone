import { useContext, useEffect } from "react";
import { ToastContext } from "../context/ToastContext";
import { CheckCircle, ErrorOutline, InfoOutlined, WarningAmber, Close } from "@mui/icons-material";
import "./toast.scss";

const ICONS = {
  success: <CheckCircle fontSize="small" />,
  error:   <ErrorOutline fontSize="small" />,
  info:    <InfoOutlined fontSize="small" />,
  warning: <WarningAmber fontSize="small" />,
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`toast toast--${toast.type}${toast.exiting ? " toast--exit" : ""}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
        <Close fontSize="inherit" />
      </button>
      <div
        className="toast-progress"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
};

const Toast = () => {
  const { toasts, remove } = useContext(ToastContext);
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
};

export default Toast;
