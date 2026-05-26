import Home from "./containers/home/Home";
import Login from "./containers/login/Login";
import Profile from "./containers/profile/Profile";
import Register from "./containers/register/Register";
import NotFound from "./containers/not-found/NotFound";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./components/context/AuthContext";
import Messenger from "./containers/messenger/messenger";
function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={user ? <Home /> : <Register />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          <Route
            path="/messenger"
            element={user ? <Messenger /> : <Navigate to="/" replace />}
          />

          <Route
            path="/profile/:userName"
            element={!user ? <Navigate to="/" replace /> : <Profile />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
