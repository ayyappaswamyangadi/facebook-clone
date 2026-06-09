import "./register.scss";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const Register = () => {
  const userName = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSendOtp = async () => {
    setError("");

    if (!userName.current.value || !email.current.value || !password.current.value || !passwordAgain.current.value) {
      setError("Please fill in all fields before requesting an OTP.");
      return;
    }
    if (password.current.value !== passwordAgain.current.value) {
      setError("Passwords do not match.");
      return;
    }
    if (password.current.value.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setOtpLoading(true);
    try {
      await axios.post("/auth/send-otp", { email: email.current.value, purpose: "register" });
      setOtpSent(true);
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === "string" ? msg : "Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleClick = async (event) => {
    event.preventDefault();
    setError("");

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/register", {
        userName: userName.current.value,
        email: email.current.value,
        password: password.current.value,
        otp: otp.trim(),
      });
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === "string") setError(msg);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register-wrapper">
        <div className="register-left">
          <h3 className="register-logo">facebook</h3>
          <span className="register-desc">
            Connect with friends and the world around you on Facebook
          </span>
        </div>
        <div className="register-right">
          <form onSubmit={handleClick} className="register-box">
            <h2 className="register-title">Create a new account</h2>
            <p className="register-subtitle">It's quick and easy.</p>
            <hr className="register-divider" />

            <input
              type="text"
              ref={userName}
              className="register-input"
              placeholder="Username"
              required
              minLength={3}
              disabled={otpSent}
            />
            <input
              type="email"
              ref={email}
              className="register-input"
              placeholder="Email address"
              required
              disabled={otpSent}
            />
            <input
              type="password"
              ref={password}
              className="register-input"
              placeholder="New password"
              minLength="6"
              required
              disabled={otpSent}
            />
            <input
              type="password"
              ref={passwordAgain}
              className="register-input"
              placeholder="Confirm password"
              required
              disabled={otpSent}
            />

            {otpSent && (
              <div className="register-otp-section">
                <p className="register-otp-info">
                  A 6-digit verification code was sent to your email.
                </p>
                <input
                  type="text"
                  className="register-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <span
                  className="register-resend"
                  onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                >
                  Resend OTP
                </span>
              </div>
            )}

            {error && <p className="register-error">{error}</p>}

            <p className="register-terms">
              By clicking Sign Up, you agree to our Terms and Privacy Policy.
            </p>

            <button className="register-button" type="submit" disabled={loading || otpLoading}>
              {otpLoading ? (
                <CircularProgress color="inherit" size="20px" />
              ) : loading ? (
                <CircularProgress color="inherit" size="20px" />
              ) : otpSent ? (
                "Sign Up"
              ) : (
                "Send OTP & Continue"
              )}
            </button>
            <Link to="/login" className="register-login-button-link">
              <button type="button" className="register-login-button">
                Already have an account? Log in
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
