import { useContext } from "react";
import Topbar from "../../components/topbar/Topbar";
import "./not-found.scss";
import { Link } from "react-router-dom";
import { AuthContext } from "../../components/context/AuthContext";

const NotFound = () => {
  const { user } = useContext(AuthContext);
  return (
    <>
      {user && <Topbar />}
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link className="not-found-go-home" to="/">
          Go to Homepage
        </Link>
      </div>
    </>
  );
};

export default NotFound;
