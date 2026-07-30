import axios from "axios";

export const loginCall = async (userCredentials, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const response = await axios.post("auth/login", userCredentials);
    dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
  } catch (err) {
    const msg = err.response?.data;
    dispatch({ type: "LOGIN_FAILURE", payload: typeof msg === "string" ? msg : "Login failed. Please check your connection and try again." });
  }
};
