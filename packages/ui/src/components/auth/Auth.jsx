import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../common/modal/Modal";
import SignUp from "./Signup";
import SignIn from "./Signin";
import styles from "./Auth.module.css";

const AuthModal = ({
  isOpen,
  onClose,
  redirectAfterLogin,
  initialMfaRequired = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const toggleForm = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsFlipped(!isFlipped);
      setShowSignUp(!showSignUp);
      setIsTransitioning(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      customWidth={"460px"}
      customClass={styles["auth-modal"]}
    >
      <div
        style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.3s" }}
      >
        {!showSignUp && (
          <SignIn
            toggleForm={toggleForm}
            onClose={onClose}
            redirectAfterLogin={redirectAfterLogin}
            initialMfaRequired={initialMfaRequired}
          />
        )}
        {showSignUp && <SignUp toggleForm={toggleForm} onClose={onClose} />}
      </div>
    </Modal>
  );
};

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  redirectAfterLogin: PropTypes.string,
  initialMfaRequired: PropTypes.bool,
};

export default AuthModal;
