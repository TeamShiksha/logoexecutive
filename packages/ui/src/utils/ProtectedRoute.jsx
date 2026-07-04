import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext, UserContext } from "../contexts/Contexts";
import LoadingSpinner from "../components/common/loadingspinner/LoadingSpinner";

function ProtectedRoute({ adminOnly = false, children }) {
  const location = useLocation();
  const { isAuthenticated, isAuthCheckComplete = true } =
    useContext(AuthContext);
  const { userData, loading, fetchUserData } = useContext(UserContext);
  const [hasFetched, setHasFetched] = useState(false);
  useEffect(() => {
    if (
      isAuthCheckComplete &&
      adminOnly &&
      isAuthenticated &&
      !loading &&
      !userData &&
      !hasFetched
    ) {
      setHasFetched(true);
      fetchUserData();
    }
  }, [
    isAuthCheckComplete,
    adminOnly,
    loading,
    userData,
    hasFetched,
    fetchUserData,
    isAuthenticated,
  ]);

  if (!isAuthCheckComplete) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner size={40} border={4} color="var(--primary)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!adminOnly) {
    return children;
  }

  if (!loading && !userData) {
    alert("Something went wrong!");
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          inset: "0",
        }}
      >
        <LoadingSpinner size={40} border={4} color="var(--primary)" />
      </div>
    );
  }

  if (userData.userType !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

export default ProtectedRoute;
