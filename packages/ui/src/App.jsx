import { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./page/home/Home";
import Dashboard from "./page/dashboard/Dashboard";
import Footer from "./components/footer/Footer";
import AuthModal from "./components/auth/Auth";
import PrivacyPolicy from "./page/privacypolicy/PrivacyPolicy";
import Documentation from "./page/documentation/Documentation";
import ScrollManager from "./components/common/ScrollManager";
import ProtectedRoute from "./utils/ProtectedRoute";
import Verification from "./page/verification/Verification";
import NotFound from "./page/notfound/NotFound";
import "./index.css";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import Release from "./page/release/Release.jsx";
import CreateLogo from "./page/createlogo/CreateLogo.jsx";
import UserSettings from "./components/usersettings/UserSettings.jsx";
import { OAUTH_ERROR_MESSAGES } from "./utils/Constants";
import { useToast } from "./hooks/useToast.js";

function App() {
  const [authModal, setAuthModal] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/dashboard");
  const [initialMfaRequired, setInitialMfaRequired] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const openCloseAuthModal = (redirectPath = "/dashboard") => {
    setRedirectAfterLogin(redirectPath);
    setAuthModal((prev) => !prev);
    if (authModal) {
      setInitialMfaRequired(false);
    }
  };

  useEffect(() => {
    const error = searchParams.get("error");
    const mfaRequired = searchParams.get("mfaRequired");

    if (error) {
      toast.error(
        OAUTH_ERROR_MESSAGES[error] || OAUTH_ERROR_MESSAGES.oauth_failed
      );
      setAuthModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("error");
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (mfaRequired === "true") {
      setInitialMfaRequired(true);
      setAuthModal(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("mfaRequired");
      nextParams.delete("from");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  return (
    <div className="app-container">
      <ScrollManager />
      <Header openAuthModal={openCloseAuthModal} />
      <div className="content-wrapper">
        <Routes>
          <Route
            path="/"
            element={<Home openAuthModal={openCloseAuthModal} />}
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/release" element={<Release />} />
          <Route
            path="/createlogo"
            element={<CreateLogo openAuthModal={openCloseAuthModal} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly={false}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute adminOnly={false}>
                <UserSettings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <AuthModal
        isOpen={authModal}
        onClose={openCloseAuthModal}
        redirectAfterLogin={redirectAfterLogin}
        initialMfaRequired={initialMfaRequired}
      />{" "}
    </div>
  );
}

export default App;
