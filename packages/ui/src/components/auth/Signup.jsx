import { useState, useEffect, useMemo } from "react";
import { Eye, EyeClosed } from "lucide-react";
import CustomInput from "../common/input/CustomInput";
import Button from "../common/button/Button";
import PropTypes from "prop-types";
import { SIGNUP, BUTTON_TEXT, MESSAGES, BRANDING } from "../../utils/Constants";
import styles from "./SignForm.module.css";
import {
  getPasswordCriteria,
  handleNavigation,
  validate,
} from "../../utils/Helpers";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast.js";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme.js";
function SignUp({ toggleForm, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [formValues, setFormValues] = useState(SIGNUP.initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [keepShowingStrength, setKeepShowingStrength] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDarkMode } = useTheme();
  const { makeRequest, errorMsg } = useApi({
    url: `/auth/signup`,
    method: "post",
    data: formValues,
  });

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg, toast]);

  useEffect(() => {
    if (!focusedField) {
      setFormErrors({});
      return;
    }
    const timeout = setTimeout(() => {
      const validationErrors = validate({
        [focusedField]: formValues[focusedField],
        password: formValues.password,
      });
      setFormErrors({
        [focusedField]: validationErrors[focusedField] || "",
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [focusedField, formValues]);

  useEffect(() => {
    const errors = validate(formValues);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setFormErrors({});
    setFocusedField(null);
    setIsLoading(true);

    const success = await makeRequest();
    if (success) {
      setFormValues(SIGNUP.initialValues);
      setFocusedField(null);
      toggleForm();
      toast.success(MESSAGES.SIGN_UP_SUCCESS);
    }
    setIsLoading(false);
  };

  // Password strength criteria
  const passwordCriteria = useMemo(
    () => getPasswordCriteria(formValues.password),
    [formValues.password]
  );

  const strengthCount = passwordCriteria.filter((c) => c.met).length;
  const allConditionsMet = passwordCriteria.every((criterion) => criterion.met);
  const getStrengthLevel = (count) => {
    if (!formValues.password.trim()) return "";
    if (count <= 2) return "weak";
    if (count === 3) return "medium";
    return "strong";
  };

  useEffect(() => {
    if (allConditionsMet) {
      setKeepShowingStrength(true);

      const timer = setTimeout(() => {
        setKeepShowingStrength(false);
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [allConditionsMet]);

  const strengthLevel = getStrengthLevel(strengthCount);
  return (
    <>
      <form
        noValidate
        className={styles.form}
        data-testid="signup-form"
        onSubmit={handleSubmit}
      >
        {/* Header with icon */}
        <img
          src={isDarkMode ? BRANDING.imageSrcDark : BRANDING.imageSrc}
          alt="openlogo"
          className={styles.logo}
        />
        <h2 className={styles["title"]}>{SIGNUP.title}</h2>
        <p className={styles.description}>{SIGNUP.description}</p>

        {/* Form fields */}
        <div className={styles["form-width"]}>
          {SIGNUP["fields"].map((field) => {
            if (field.name === "password") {
              return (
                <div key={field.name} className={styles["password-container"]}>
                  <div className={styles["password-wrapper"]}>
                    <CustomInput
                      error=""
                      type={showPassword ? "text" : "password"}
                      name={field.name}
                      label={field.label}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      onFocus={() => {
                        setFocusedField(field.name);
                        setShowPasswordRules(true);
                      }}
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
                  <div
                    className={`${styles["strength-card"]} ${
                      showPasswordRules &&
                      formValues.password.length > 0 &&
                      (!allConditionsMet || keepShowingStrength)
                        ? styles["strength-card-visible"]
                        : ""
                    }`}
                  >
                    <div className={styles["password-info"]}>
                      <div className={styles["password-header"]}>
                        <span>Password strength</span>
                        <span className={styles[strengthLevel]}>
                          {strengthLevel}
                        </span>
                      </div>

                      <div className={styles["strength-bars"]}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`${styles["strength-bar"]} ${
                              i < strengthCount
                                ? `${styles["strength-bar-active"]} ${styles[`bar-${strengthLevel}`]}`
                                : ""
                            }`}
                          />
                        ))}
                      </div>

                      <p className={styles["needs-text"]}>
                        <strong>Needs:</strong>{" "}
                        {allConditionsMet
                          ? "All requirements satisfied"
                          : passwordCriteria
                              .filter((c) => !c.met)
                              .map((c) => c.label)
                              .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            if (field.name === "confirmPassword") {
              return (
                <div key={field.name} className={styles["password-wrapper"]}>
                  <CustomInput
                    error={formErrors[field.name]}
                    type={showConfirmPassword ? "text" : "password"}
                    name={field.name}
                    label={field.label}
                    value={formValues[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    autoComplete={field.autoComplete}
                  />
                  <button
                    type="button"
                    className={styles["eye-button"]}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    tabIndex={-1}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setShowConfirmPassword(!showConfirmPassword);
                      }
                    }}
                  >
                    {showConfirmPassword ? (
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
                value={formValues[field.name]}
                onChange={handleChange}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading}
                autoComplete={field.autoComplete}
              />
            );
          })}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          className={styles["submit-button"]}
          isLoading={isLoading}
          disabled={!isFormValid}
        >
          {BUTTON_TEXT.signUp}
        </Button>
      </form>

      {/* Terms & Privacy */}
      <p className={styles["signup-footer-terms"]}>
        By Signing Up, you agree to our{" "}
        <Link
          to={SIGNUP.termsUrl}
          onClick={(event) => {
            onClose();
            handleNavigation(event, SIGNUP.termsUrl, navigate);
          }}
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to={SIGNUP.privacyUrl}
          onClick={(event) => {
            onClose();
            handleNavigation(event, SIGNUP.privacyUrl, navigate);
          }}
        >
          Privacy Policy
        </Link>
        .
      </p>

      {/* Already have an account */}
      <hr className={styles.separator} />
      <div className={styles["footer-wrapper"]}>
        <div className={styles.switch}>
          {SIGNUP.footerText}{" "}
          <button
            type="button"
            className={styles["toggler"]}
            onClick={toggleForm}
          >
            {SIGNUP.signinToggleButtonText}
          </button>
        </div>
      </div>
    </>
  );
}

SignUp.propTypes = {
  toggleForm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default SignUp;
