import { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Eye, EyeClosed, User } from "lucide-react";
import CustomInput from "../common/input/CustomInput";
import Button from "../common/button/Button";
import { BRANDING, BUTTON_TEXT, MESSAGES, SIGNIN } from "../../utils/Constants";
import styles from "./SignForm.module.css";
import { validate } from "../../utils/Helpers";
import { useApi } from "../../hooks/useApi";
import { AuthContext } from "../../contexts/Contexts";
import { useToast } from "../../hooks/useToast.js";
import Pin from "../pin/Pin";
import { useTheme } from "../../hooks/useTheme.js";

const SignIn = ({ toggleForm, onClose, redirectAfterLogin = "/dashboard" }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(SIGNIN.initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { setIsAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const isGuestLock = useRef(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode } = useTheme();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);

  const { fetchRequest, errorMsg } = useApi({
    method: "post",
    url: isForgotPassword ? `/auth/password/forgot` : `/auth/signin`,
    data: isForgotPassword ? { email: formData.email } : formData,
  });

  const { makeRequest: makeGuestRequest, errorMsg: guestErrorMsg } = useApi({
    method: "post",
    url: `/auth/signin?type=guest`,
  });

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg, toast]);

  useEffect(() => {
    if (guestErrorMsg) toast.error(guestErrorMsg);
  }, [guestErrorMsg, toast]);

  useEffect(() => {
    if (focusedField !== "email") {
      setFormErrors({});
      return;
    }
    const timer = setTimeout(() => {
      const validationErrors = validate({
        [focusedField]: formData[focusedField],
      });
      setFormErrors({
        [focusedField]: validationErrors[focusedField] || "",
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [focusedField, formData]);

  useEffect(() => {
    const fieldsToValidate = { email: formData.email };
    const errors = validate(fieldsToValidate);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData, isForgotPassword]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    const stored = localStorage.getItem("fp_nextAllowedAt");
    if (!stored) return;
    const timestamp = new Date(stored).getTime();
    if (Number.isNaN(timestamp)) {
      localStorage.removeItem("fp_nextAllowedAt");
      return;
    }
    const diff = Math.floor((timestamp - Date.now()) / 1000);
    if (diff <= 0) {
      localStorage.removeItem("fp_nextAllowedAt");
      return;
    }
    setTimer(diff);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("fp_nextAllowedAt");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setIsLoading(true);
    if (isForgotPassword) {
      const { data, success } = await fetchRequest({
        data: { email: formData.email },
      });

      const nextAllowed = data?.nextAllowedAt;
      if (nextAllowed) {
        const nextAllowedDate = new Date(nextAllowed);
        if (!isNaN(nextAllowedDate.getTime())) {
          localStorage.setItem("fp_nextAllowedAt", nextAllowed);
          const diff = Math.floor((nextAllowedDate - new Date()) / 1000);
          setTimer(diff > 0 ? diff : 0);
        }
        if (success) {
          toast.success(MESSAGES.REST_EMAIL_SENT);
        }
      }
    } else {
      const { data, success } = await fetchRequest({
        data: formData,
      });

      if (success) {
        if (data.source && data.statusCode === 201) {
          toast.success(MESSAGES.VERIFICATION_EMAIL_SENT);
        } else if (data.mfaRequired && data.statusCode === 200) {
          setIsMFAEnabled(true);
        } else {
          setFormData(SIGNIN.initialValues);
          setIsAuthenticated(true);
          onClose();
          if (window.location.pathname !== redirectAfterLogin) {
            navigate(redirectAfterLogin);
          }
          toast.success(MESSAGES.SIGN_IN_SUCCESS);
        }
        setFocusedField(null);
      }
    }
    setIsLoading(false);
  };

  const handleGuestSignIn = async (submitEvent) => {
    submitEvent.preventDefault();

    if (isGuestLock.current) return;

    isGuestLock.current = true;
    setIsSubmit(true);

    try {
      const success = await makeGuestRequest();

      if (success) {
        setIsAuthenticated(true);
        onClose();
        if (window.location.pathname !== redirectAfterLogin) {
          navigate(redirectAfterLogin);
        }
        toast.success(MESSAGES.GUEST_SIGN_IN_SUCCESS);
      }
    } finally {
      setTimeout(() => {
        isGuestLock.current = false;
        setIsSubmit(false);
      }, 1000);
    }
  };

  const handleToggleForgotPassword = () => {
    setFormErrors({});
    setFocusedField(null);
    setIsSubmit(false);
    setFormData(SIGNIN.initialValues);
    setIsForgotPassword(!isForgotPassword);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <img
          src={isDarkMode ? BRANDING.imageSrcDark : BRANDING.imageSrc}
          alt="openlogo"
          className={styles.logo}
        />
        <h2 className={styles.title}>{SIGNIN.title}</h2>
        <p className={styles.description}>{SIGNIN.description}</p>

        {!isMFAEnabled && (
          <div className={styles["form-width"]}>
            {SIGNIN["fields"]
              .filter(
                (field) => !(isForgotPassword && field.name === "password")
              )
              .map((field) => {
                if (field.name === "password" && !isForgotPassword) {
                  return (
                    <div
                      key={field.name}
                      className={styles["password-wrapper"]}
                    >
                      <CustomInput
                        error={formErrors[field.name]}
                        type={showPassword ? "text" : "password"}
                        name={field.name}
                        label={field.label}
                        value={formData[field.name]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading}
                        autoComplete={field.autoComplete}
                      />
                      <button
                        type="button"
                        className={styles["eye-button"]}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        tabIndex={-1}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setShowPassword(!showPassword);
                          }
                        }}
                      >
                        {showPassword ? (
                          <Eye size={20} />
                        ) : (
                          <EyeClosed size={20} />
                        )}
                      </button>
                    </div>
                  );
                }
                return (
                  <CustomInput
                    error={formErrors[field.name]}
                    key={field.name}
                    type={field.type}
                    name={field.name}
                    label={field.label}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    autoComplete={field.autoComplete}
                  />
                );
              })}
          </div>
        )}

        {isMFAEnabled && <Pin onClose={onClose} />}

        {isForgotPassword && !isMFAEnabled && (
          <p
            onClick={handleToggleForgotPassword}
            className={styles["forgot-password"]}
          >
            {BUTTON_TEXT.backToSignIn}
          </p>
        )}

        {!isForgotPassword && !isMFAEnabled && (
          <p
            className={styles["forgot-password"]}
            onClick={handleToggleForgotPassword}
          >
            {BUTTON_TEXT.forgotPassword}
          </p>
        )}

        {!isMFAEnabled && (
          <Button
            type="submit"
            variant="primary"
            className={styles["submit-button"]}
            isLoading={isLoading}
            disabled={
              !isFormValid ||
              isSubmit ||
              isLoading ||
              (isForgotPassword && timer > 0)
            }
          >
            {isForgotPassword ? BUTTON_TEXT.submit : BUTTON_TEXT.signIn}
          </Button>
        )}
        {isForgotPassword && timer > 0 && (
          <p className={styles["timer"]}>
            Please wait {timer} seconds before retrying.
          </p>
        )}
      </form>

      <hr className={styles.separator} />
      <div className={styles["footer-wrapper"]}>
        <p onClick={handleGuestSignIn} className={styles["guest-sign-in"]}>
          <User size={18} /> {SIGNIN.guestAccount}
        </p>
        <div className={styles.switch}>
          {SIGNIN.footerText}
          <button onClick={toggleForm} className={styles["toggler"]}>
            {SIGNIN.signupToggleButtonText}
          </button>
        </div>
      </div>
    </>
  );
};

SignIn.propTypes = {
  toggleForm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  redirectAfterLogin: PropTypes.string,
};

export default SignIn;
