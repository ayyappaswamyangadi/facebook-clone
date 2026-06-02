import "./login.scss"
import { useContext, useRef } from "react";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../components/context/AuthContext";
import { CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

const Login = () => {

    const email = useRef();
    const password = useRef();
    const { loading, dispatch } = useContext(AuthContext)

    const handleClick = (event) => {
        event.preventDefault();
        loginCall({ email: email.current.value, password: password.current.value }, dispatch)
    }

    return (
        <div className="login">
            <div className="login-wrapper">
                <div className="login-left">
                    <h3 className="login-logo">facebook</h3>
                    <span className="login-desc">Connect with friends and the world around you on facebook</span>
                </div>
                <div className="login-right">
                    <form className="login-box" onSubmit={handleClick}>
                        <input type="email" className="login-input"
                            placeholder="Email" ref={email} required minLength="6" />
                        <input type="password" className="login-input"
                            placeholder="password" ref={password} required />
                        <button className="login-button" disabled={loading}>{loading ? <CircularProgress color="inherit" size="25px" /> : "Login"}</button>
                        <span className="login-forgot">Forgot Password</span>
                        <Link to="/register" className="login-register-button-link">
                            <button className="login-register-button">Create a new Account</button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login