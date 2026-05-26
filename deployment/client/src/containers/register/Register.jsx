import "./register.scss"
import { Link, useNavigate } from "react-router-dom"
import { useRef } from "react"
import axios from "axios";
const Register = () => {
    const userName = useRef();
    const email = useRef();
    const password = useRef();
    const passwordAgain = useRef();
    const navigate = useNavigate();

    const handleClick = async (event) => {
        event.preventDefault();
        if (password.current.value !== passwordAgain.current.value) {
            passwordAgain.current.setCustomValidity("passwords do not match")
        } else {
            const user = {
                userName: userName.current.value,
                email: email.current.value,
                password: password.current.value,
            }
            try {
                await axios.post("/auth/register", user)
                navigate("/login");
            } catch (err) {
                console.log(err);
            }
        }
    }
    return (
        <div className="register">
            <div className="register-wrapper">
                <div className="register-left">
                    <h3 className="register-logo">facebook</h3>
                    <span className="register-desc">Connect with friends and the world around you on facebook</span>
                </div>
                <div className="register-right">
                    <form onSubmit={handleClick} className="register-box">
                        <input type="text" ref={userName} className="register-input"
                            placeholder="User Name" required />
                        <input type="email" ref={email} className="register-input"
                            placeholder="Email" required />
                        <input type="password" ref={password} className="register-input"
                            placeholder="Password" minLength="6" required />
                        <input type="password" ref={passwordAgain} className="register-input"
                            placeholder="re-enter the Password" required />
                        <button className="register-button">Register</button>
                        <Link to="/login" className="register-login-button-link">
                            <button className="register-login-button">Login to the existing account</button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register