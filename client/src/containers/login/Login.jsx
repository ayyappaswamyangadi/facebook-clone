import "./login.scss";
import { useContext, useRef, useState } from "react";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../components/context/AuthContext";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const email = useRef();
  const password = useRef();
  const { loading, error, dispatch } = useContext(AuthContext);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleClick = (event) => {
    event.preventDefault();
    loginCall(
      { email: email.current.value, password: password.current.value },
      dispatch
    );
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    if (forgotNewPwd.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      await axios.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
        newPassword: forgotNewPwd,
      });
      setForgotSuccess("Password reset successful! You can now log in with your new password.");
      setForgotNewPwd("");
      setForgotConfirmPwd("");
    } catch (err) {
      setForgotError(
        err.response?.data || "No account found with that email. Please check and try again."
      );
    }
    setForgotLoading(false);
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotEmail("");
    setForgotNewPwd("");
    setForgotConfirmPwd("");
    setForgotError("");
    setForgotSuccess("");
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        <div className="login-left">
          <h3 className="login-logo">facebook</h3>
          <span className="login-desc">
            Connect with friends and the world around you on Facebook
          </span>
        </div>
        <div className="login-right">
          <form className="login-box" onSubmit={handleClick}>
            <input
              type="email"
              className="login-input"
              placeholder="Email address"
              ref={email}
              required
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              ref={password}
              required
            />
            {error && (
              <p className="login-error">
                {typeof error === "string" ? error : "Login failed. Please try again."}
              </p>
            )}
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress color="inherit" size="22px" />
              ) : (
                "Log In"
              )}
            </button>
            <span className="login-forgot" onClick={() => setShowForgot(true)}>
              Forgot Password?
            </span>
            <hr className="login-divider" />
            <Link to="/register" className="login-register-button-link">
              <button type="button" className="login-register-button">
                Create New Account
              </button>
            </Link>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="forgot-overlay" onClick={closeForgot}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="forgot-modal-header">
              <h3 className="forgot-modal-title">Reset Your Password</h3>
              <button className="forgot-modal-close" onClick={closeForgot}>✕</button>
            </div>
            <p className="forgot-modal-desc">
              Enter your email address and choose a new password.
            </p>
            <hr className="login-divider" />
            {forgotSuccess ? (
              <div className="forgot-success">
                <p>{forgotSuccess}</p>
                <button className="login-button" style={{ marginTop: 12 }} onClick={closeForgot}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form className="forgot-form" onSubmit={handleForgotSubmit}>
                <input
                  type="email"
                  className="login-input"
                  placeholder="Your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="login-input"
                  placeholder="New password (min. 6 characters)"
                  value={forgotNewPwd}
                  onChange={(e) => setForgotNewPwd(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="login-input"
                  placeholder="Confirm new password"
                  value={forgotConfirmPwd}
                  onChange={(e) => setForgotConfirmPwd(e.target.value)}
                  required
                />
                {forgotError && <p className="login-error">{forgotError}</p>}
                <button
                  className="login-button"
                  type="submit"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <CircularProgress color="inherit" size="22px" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
                <button
                  type="button"
                  className="forgot-cancel-btn"
                  onClick={closeForgot}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
