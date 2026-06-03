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

  const handleClick = async (event) => {
    event.preventDefault();
    setError("");

    if (password.current.value !== passwordAgain.current.value) {
      setError("Passwords do not match.");
      return;
    }

    if (password.current.value.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const user = {
      userName: userName.current.value,
      email: email.current.value,
      password: password.current.value,
    };

    try {
      await axios.post("/auth/register", user);
      navigate("/login");
    } catch (err) {
      console.log(err);
      const msg = err.response?.data;
      if (typeof msg === "string") setError(msg);
      else setError("Registration failed. Username or email may already be taken.");
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
            />
            <input
              type="email"
              ref={email}
              className="register-input"
              placeholder="Email address"
              required
            />
            <input
              type="password"
              ref={password}
              className="register-input"
              placeholder="New password"
              minLength="6"
              required
            />
            <input
              type="password"
              ref={passwordAgain}
              className="register-input"
              placeholder="Confirm password"
              required
            />

            {error && <p className="register-error">{error}</p>}

            <p className="register-terms">
              By clicking Sign Up, you agree to our Terms and Privacy Policy.
            </p>

            <button className="register-button" type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress color="inherit" size="20px" />
              ) : (
                "Sign Up"
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
