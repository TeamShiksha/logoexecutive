import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { LayoutGrid, Send } from "lucide-react";
import Modal from "../common/modal/Modal";
import Button from "../common/button/Button";
import styles from "./ContactForm.module.css";
import { BUTTON_TEXT, CONTACT, MODAL_MESSAGES } from "../../utils/Constants";
import { validate } from "../../utils/Helpers";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

function ContactForm({ closeModal }) {
  const [formValues, setFormValues] = useState(CONTACT.initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const { makeRequest, data, loading, errorMsg } = useApi({
    url: "/messages/contact-us",
    method: "POST",
    data: formValues,
  });

  const toast = useToast();

  // Handle API response — show toast and close modal
  useEffect(() => {
    if (!errorMsg && !data?.message) return;

    if (errorMsg) {
      toast.error(errorMsg);
    } else {
      toast.success(data.message);
    }

    const timeout = setTimeout(() => {
      setFormErrors({});
      setFocusedField(null);
      setFormValues(CONTACT.initialValues);
      closeModal();
    }, 500);

    return () => clearTimeout(timeout);
  }, [errorMsg, data, toast, closeModal]);

  // Validate fields on focus change (with debounce for active field)
  useEffect(() => {
    if (!focusedField) {
      const filledFields = Object.keys(formValues).filter(
        (field) => formValues[field] !== CONTACT.initialValues[field]
      );
      const errors = validate(
        filledFields.reduce(
          (acc, field) => ({ ...acc, [field]: formValues[field] }),
          {}
        )
      );
      setFormErrors(errors);
      return;
    }

    const immediateErrors = validate({
      [focusedField]: formValues[focusedField],
    });
    setFormErrors((prev) => ({
      ...prev,
      [focusedField]: immediateErrors[focusedField],
    }));

    const timeout = setTimeout(() => {
      const debouncedErrors = validate({
        [focusedField]: formValues[focusedField],
      });
      setFormErrors((prev) => ({
        ...prev,
        [focusedField]: debouncedErrors[focusedField],
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [focusedField, formValues]);

  // Track overall form validity
  useEffect(() => {
    const errors = validate(formValues);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formValues]);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await makeRequest();
  };

  const getFieldErrorClass = (hasError) =>
    `${styles["field-error"]} ${hasError ? styles["field-error-visible"] : ""}`;

  return (
    <Modal
      onClose={closeModal}
      isOpen={true}
      customClass={styles["contact-modal"]}
      showCloseButton={true}
    >
      <div className={styles["contact-wrapper"]}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles["sidebar-content"]}>
            <LayoutGrid className={styles["sidebar-icon"]} aria-hidden="true" />
            <h3 className={styles["sidebar-title"]}>
              Let&apos;s discuss your integration needs.
            </h3>
          </div>
        </div>

        {/* Right Form */}
        <form
          onSubmit={handleSubmit}
          className={styles["form-section"]}
          noValidate
        >
          <div className={styles["field-group"]}>
            <label className={styles["field-label"]} htmlFor="contact-name">
              Full Name
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formValues.name}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              className={styles["field-input"]}
              autoComplete="name"
            />
            <p className={getFieldErrorClass(formErrors.name)} role="alert">
              {formErrors.name}
            </p>
          </div>

          <div className={styles["field-group"]}>
            <label className={styles["field-label"]} htmlFor="contact-email">
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              placeholder="john@company.com"
              value={formValues.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={styles["field-input"]}
              autoComplete="email"
            />
            <p className={getFieldErrorClass(formErrors.email)} role="alert">
              {formErrors.email}
            </p>
          </div>

          <div className={styles["field-group"]}>
            <label className={styles["field-label"]} htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Tell us about your project goals..."
              value={formValues.message}
              onChange={handleInputChange}
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
              className={styles["field-textarea"]}
            />
            <div className={styles["message-footer"]}>
              <p
                className={`${styles["message-error"]} ${
                  formErrors.message ? styles["message-error-visible"] : ""
                }`}
                role="alert"
              >
                {formErrors.message}
              </p>
              <p
                className={`${styles["character-count"]} ${
                  formValues.message.length >= 100 ? styles["count-limit"] : ""
                }`}
                aria-live="polite"
              >
                {`[${formValues.message.length}/${MODAL_MESSAGES.CHARACTER_LIMIT}]`}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid}
            isLoading={loading}
            className={styles["submit-btn"]}
          >
            {BUTTON_TEXT.sendMessage}
            <Send className={styles["submit-btn-icon"]} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </Modal>
  );
}

ContactForm.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default ContactForm;
