import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { MESSAGES, USER_INFO_FIELDS } from "../../utils/Constants";
import styles from "./UserInfo.module.css";
import Button from "../common/button/Button";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import { validate } from "../../utils/Helpers";

function UserInfo({ name, email, isGuest }) {
  const toast = useToast();
  const initialValues = {
    name,
    email,
    isBtnDisabled: true,
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({
    type: "",
    message: "",
  });
  const { makeRequest, errorMsg } = useApi({
    method: "PATCH",
    url: "/user/me",
    data: {
      name: formData.name,
    },
  });

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg, toast]);

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    const validationErrors = validate({ ...formData, [name]: value });
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors({
        type: "error",
        message: Object.values(validationErrors)[0],
      });
    } else {
      setFormErrors({ type: "", message: "" });
    }
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        isBtnDisabled: isGuest,
        [name]: value,
      };
    });
  };

  const handleUserInfoUpdate = async (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors({
        type: "error",
        message: Object.values(validationErrors)[0],
      });
      setFormData((prevFormData) => {
        return {
          ...prevFormData,
          isBtnDisabled: true,
        };
      });
      return;
    }

    try {
      setIsUpdating(true);
      const success = await makeRequest();
      if (success) {
        setFormErrors({ type: "", message: "" });
        toast.success(MESSAGES.USERNAME_UPDATE_SUCCESS);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form className={styles["user-info-form"]}>
      {USER_INFO_FIELDS.map((field) => (
        <div key={field.name} className={styles["form-group"]}>
          <div className={styles["input-wrapper"]}>
            <span className={styles["floating-label"]}>{field.label}</span>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleUserInfoChange}
              className={styles["input"]}
              disabled={field.name === "email"}
              data-testid={`input-${field.name}`}
              aria-label={field.label}
            />
          </div>
          {field.name === "name" && formErrors.type === "error" && (
            <span className={styles["error-message"]}>
              {formErrors.message}
            </span>
          )}
        </div>
      ))}
      <Button
        onClick={handleUserInfoUpdate}
        disabled={formData.isBtnDisabled || isUpdating}
        variant={"primary"}
        isLoading={isUpdating}
        className={styles["submit-btn"]}
      >
        Save
      </Button>
    </form>
  );
}

UserInfo.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  isGuest: PropTypes.bool.isRequired,
};

export default UserInfo;
