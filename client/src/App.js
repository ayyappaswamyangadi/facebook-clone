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
  useLocation,
} from "react-router-dom";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "./components/context/AuthContext";
import Messenger from "./containers/messenger/messenger";

const ScrollRestorer = () => {
  const location = useLocation();
  const savedScrolls = useRef({});
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPathVal = prevPath.current;

    const saveScroll = () => {
      savedScrolls.current[prevPathVal] = window.scrollY;
    };

    window.addEventListener("scroll", saveScroll, { passive: true });

    const restored = savedScrolls.current[currentPath] ?? 0;
    window.scrollTo(0, restored);

    prevPath.current = currentPath;

    return () => {
      window.removeEventListener("scroll", saveScroll);
    };
  }, [location.pathname]);

  return null;
};

function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <Router>
        <ScrollRestorer />
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
            path="messenger/"
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
