import { lazy, Suspense, useContext, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthContext } from "./components/context/AuthContext";
import { SocketProvider } from "./components/context/SocketContext";
import { ToastProvider } from "./components/context/ToastContext";
import { ConfirmProvider } from "./components/context/ConfirmContext";
import Toast from "./components/toast/Toast";

const Home     = lazy(() => import("./containers/home/Home"));
const Login    = lazy(() => import("./containers/login/Login"));
const Profile  = lazy(() => import("./containers/profile/Profile"));
const Register = lazy(() => import("./containers/register/Register"));
const NotFound = lazy(() => import("./containers/not-found/NotFound"));
const Messenger = lazy(() => import("./containers/messenger/messenger"));

const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
    <div style={{ width: 36, height: 36, border: "3px solid #e4e6e9", borderTopColor: "#1877f2", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ScrollRestorer = () => {
  const location = useLocation();
  const savedScrolls = useRef({});
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPathVal = prevPath.current;
    const saveScroll = () => { savedScrolls.current[prevPathVal] = window.scrollY; };
    window.addEventListener("scroll", saveScroll, { passive: true });
    window.scrollTo(0, savedScrolls.current[currentPath] ?? 0);
    prevPath.current = currentPath;
    return () => window.removeEventListener("scroll", saveScroll);
  }, [location.pathname]);

  return null;
};

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ToastProvider>
      <ConfirmProvider>
        <SocketProvider>
          <Router>
            <ScrollRestorer />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route exact path="/" element={user ? <Home /> : <Register />} />
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
                <Route path="messenger/" element={user ? <Messenger /> : <Navigate to="/" replace />} />
                <Route path="/profile/:userName" element={!user ? <Navigate to="/" replace /> : <Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toast />
        </SocketProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
