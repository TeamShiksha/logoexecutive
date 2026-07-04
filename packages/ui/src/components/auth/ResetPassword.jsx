import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";
import CustomInput from "../common/input/CustomInput";
import Button from "../common/button/Button";
import { BUTTON_TEXT } from "../../utils/Constants";
import { validate } from "../../utils/Helpers.js";

import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast.js";
import CardWrapper from "../cardwrapper/CardWrapper";
import styles from "./ResetPassword.module.css";

const initialValues = {
  newPassword: "",
  confirmPassword: "",
};

const ResetPassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [localErrorMsg, setLocalErrorMsg] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const hasValidatedToken = useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    hasValidatedToken.current = false;
  }, [token]);
  const {
    makeRequest: validateTokenRequest,
    errorMsg: tokenErrorMsg,
    loading: tokenLoading,
  } = useApi({
    method: "get",
    url: `/auth/password/forgot/${token}`,
    withCredentials: true,
  });

  const {
    makeRequest: resetPasswordRequest,
    errorMsg: resetErrorMsg,
    loading: resetLoading,
  } = useApi({
    method: "patch",
    url: "/auth/password/reset",
    data: {
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
      token: token,
    },
    withCredentials: true,
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLocalErrorMsg("Invalid or missing token.");
        return;
      }

      if (hasValidatedToken.current) return;
      hasValidatedToken.current = true;

      const success = await validateTokenRequest();
      if (success) {
        setTokenValid(true);
      } else {
        setLocalErrorMsg(tokenErrorMsg || "Invalid or expired token.");
      }
    };
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-validate only when `token` changes; tokenErrorMsg would re-fire after async error state
  }, [token]);

  useEffect(() => {
    if (focusedField === "confirmPassword") {
      const errors = validate({
        password: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setFormErrors({
        confirmPassword: errors.confirmPassword || "",
      });
    } else if (isSubmit) {
      const errors = validate({
        password: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (errors.confirmPassword) {
        setFormErrors({ confirmPassword: errors.confirmPassword });
      } else {
        setFormErrors({});
      }
    } else {
      setFormErrors({});
    }
  }, [formData, focusedField, isSubmit]);

  useEffect(() => {
    const errors = validate({
      password: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    setIsFormValid(
      !errors.confirmPassword &&
        formData.newPassword &&
        formData.confirmPassword
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setIsSubmit(false);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleFocus = (event) => {
    setFocusedField(event.target.name);
    setIsSubmit(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErrorMsg("");
    setIsSubmit(true);

    const errors = validate({
      password: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });
    if (errors.confirmPassword) {
      return;
    }
    const success = await resetPasswordRequest();
    if (success) {
      toast.success("Password reset successful! Please sign in.");
      setFormData(initialValues);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      navigate("/");
    } else {
      setLocalErrorMsg(resetErrorMsg || "Failed to reset password.");
      toast.error(resetErrorMsg || "Failed to reset password.");
    }
  };

  return (
    <div className={styles["centered-outer"]}>
      <div className={styles["centered-inner"]}>
        <CardWrapper
          title={
            <span className={styles["centered-title"]}>Change Password</span>
          }
        >
          <form className={styles["form-container"]} onSubmit={handleSubmit}>
            <div
              className={`error-container${localErrorMsg ? " has-error" : ""}`}
            >
              <p className="input-error">{localErrorMsg}</p>
            </div>

            {tokenValid ? (
              <div className={styles["form-width"]}>
                <div className={styles["reset-password-wrapper"]}>
                  <CustomInput
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    label="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={resetLoading || tokenLoading}
                    required
                  />
                  <button
                    type="button"
                    className={styles["reset-password-eye-button"]}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    tabIndex={-1}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setShowNewPassword(!showNewPassword);
                      }
                    }}
                  >
                    {showNewPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeClosed size={20} />
                    )}
                  </button>
                </div>
                <div className={styles["reset-password-wrapper"]}>
                  <CustomInput
                    error={formErrors.confirmPassword}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={resetLoading || tokenLoading}
                    required
                  />
                  <button
                    type="button"
                    className={styles["reset-password-eye-button"]}
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
                <div className={styles["button-row"]}>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid || resetLoading || tokenLoading}
                  >
                    {BUTTON_TEXT.submit}
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles["form-width"]}>
                <p className={styles["error-message"]}>
                  {localErrorMsg || "Invalid or expired token."}
                </p>
              </div>
            )}
          </form>
        </CardWrapper>
      </div>
    </div>
  );
};

export default ResetPassword;
