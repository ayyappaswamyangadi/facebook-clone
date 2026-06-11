import { DeleteOutline } from "@mui/icons-material";
import "./confirm-dialog.scss";

const ConfirmDialog = ({ title, message, confirmLabel = "Delete", danger = true, onConfirm, onCancel }) => (
  <div className="confirm-overlay" onClick={onCancel}>
    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
      <div className={`confirm-icon-wrap${danger ? " confirm-icon-wrap--danger" : ""}`}>
        <DeleteOutline />
      </div>
      <h3 className="confirm-title">{title}</h3>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`confirm-btn ${danger ? "confirm-btn--danger" : "confirm-btn--primary"}`}
          onClick={onConfirm}
          autoFocus
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
