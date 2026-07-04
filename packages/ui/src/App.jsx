import { useState } from "react";
import { Route, Routes } from "react-router-dom";
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

function App() {
  const [authModal, setAuthModal] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/dashboard");
  const openCloseAuthModal = (redirectPath = "/dashboard") => {
    setRedirectAfterLogin(redirectPath);
    setAuthModal(!authModal);
  };
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
      />{" "}
    </div>
  );
}

export default App;
