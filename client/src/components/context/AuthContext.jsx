import { useEffect, useRef } from "react";
import { createContext, useReducer } from "react";
import AuthReducer from './AuthReducers'
import axios from 'axios';

const INITIAL_STATE = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: false
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE)
    const dispatchRef = useRef(dispatch);

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(state.user))
    }, [state.user])

    // Global interceptor: force logout on 401 (invalid/expired token) or
    // 404 with "User not found" (account deleted while session was active)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                const status = error.response?.status;
                const message = error.response?.data;
                const isUserGone =
                    status === 401 ||
                    (status === 404 && typeof message === 'string' && message.toLowerCase().includes("user not found"));
                if (isUserGone) {
                    dispatchRef.current({ type: "LOGOUT" });
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // On mount: verify the stored session user still exists in the DB
    useEffect(() => {
        if (!state.user?._id) return;
        axios.get(`/users?userId=${state.user._id}`).catch(err => {
            const status = err.response?.status;
            if (status === 404 || status === 401) {
                dispatch({ type: "LOGOUT" });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ user: state.user, loading: state.loading, error: state.error, dispatch }}>
            {children}
        </AuthContext.Provider >
    )
}