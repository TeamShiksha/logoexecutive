import PropTypes from "prop-types";
import { useEffect, useState, useMemo } from "react";
import { useApi } from "../../hooks/useApi.js";
import { useToast } from "../../hooks/useToast.js";
import {
  API_KEY,
  BUTTON_TEXT,
  COPY,
  EXPIRY_KEYS_OPTION,
  PUBLISHABLE_KEY,
  TICK,
} from "../../utils/Constants.js";
import { formatDate, validate } from "../../utils/Helpers.js";
import Button from "../common/button/Button.jsx";
import Dropdown from "../common/dropdown/Dropdown.jsx";
import CustomInput from "../common/input/CustomInput.jsx";
import Modal from "../common/modal/Modal.jsx";
import styles from "./ApiKeyForm.module.css";

const originRegex =
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?$|^https?:\/\/localhost(?::\d+)?$|^https?:\/\/127\.0\.0\.1(?::\d+)?$/;

function ApiKeyForm({ isGuest, onKeyGenerated, keyType = "SECRET" }) {
  const [description, setDescription] = useState("");
  const [origins, setOrigins] = useState([]);
  const [originInputText, setOriginInputText] = useState("");
  const [editingPillIndex, setEditingPillIndex] = useState(null);
  const [editingPillValue, setEditingPillValue] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(365);
  const [isActive, setIsActive] = useState(true);
  const [isOriginRestricted, setIsOriginRestricted] = useState(true);
  const toast = useToast();

  const isPublishable = keyType === "PUBLISHABLE";

  const activeOrigins = useMemo(
    () =>
      isPublishable && isOriginRestricted
        ? [
            ...origins,
            ...(originInputText.trim() &&
            !origins.includes(originInputText.trim())
              ? [originInputText.trim().replace(/^,+|,+$/g, "")]
              : []),
          ].filter(Boolean)
        : [],
    [isPublishable, isOriginRestricted, origins, originInputText]
  );

  const { makeRequest, data, loading, errorMsg } = useApi({
    method: "post",
    url: "/user/api-key",
    data: {
      key_description: description,
      expires_at: expiresInDays,
      key_type: isPublishable ? "PUBLISHABLE" : "SECRET",
      ...(isPublishable
        ? {
            allowed_origins: isOriginRestricted ? activeOrigins : [],
            is_origin_restricted: isOriginRestricted,
            is_active: isActive,
          }
        : {}),
    },
  });

  useEffect(() => {
    if (focusedField !== "apikey" && focusedField !== "originInputs") {
      setFormErrors({});
      return;
    }
    const timer = setTimeout(() => {
      const validationErrors = validate({ description });
      const errors = { apikey: validationErrors.description || "" };

      if (isPublishable) {
        if (activeOrigins.length === 0) {
          errors.allowedOrigins = PUBLISHABLE_KEY.generation.originRequired;
        } else if (!activeOrigins.every((o) => originRegex.test(o))) {
          errors.allowedOrigins = PUBLISHABLE_KEY.generation.invalidOrigin;
        }
      }

      setFormErrors(errors);
    }, 500);
    return () => clearTimeout(timer);
  }, [
    focusedField,
    description,
    activeOrigins,
    origins,
    originInputText,
    isPublishable,
  ]);

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg, toast]);

  useEffect(() => {
    if (!copyMessage) return;
    const timeout = setTimeout(() => setCopyMessage(""), 900);
    return () => clearInterval(timeout);
  }, [copyMessage]);

  const addOriginTag = (rawText) => {
    const trimmed = rawText.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (origins.includes(trimmed)) {
      toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
      setFormErrors((prev) => ({
        ...prev,
        allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
      }));
      return;
    }
    setOrigins((prev) => [...prev, trimmed]);
    setOriginInputText("");
    setFormErrors((prev) => ({ ...prev, allowedOrigins: null }));
  };

  const handleOriginKeyDown = (e) => {
    if (
      e.key === "Enter" ||
      e.key === "," ||
      e.key === " " ||
      e.key === "Tab"
    ) {
      if (e.key === "Tab") {
        if (originInputText.trim()) {
          e.preventDefault();
          addOriginTag(originInputText);
        }
      } else {
        e.preventDefault();
        addOriginTag(originInputText);
      }
    } else if (
      e.key === "Backspace" &&
      !originInputText &&
      origins.length > 0
    ) {
      setOrigins((prev) => prev.slice(0, -1));
    }
  };

  const handleOriginBlur = () => {
    if (originInputText.trim()) {
      addOriginTag(originInputText);
    }
    setFocusedField(null);
  };

  const handleRemoveOriginTag = (indexToRemove) => {
    setOrigins((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStartEditPill = (index, value) => {
    setEditingPillIndex(index);
    setEditingPillValue(value);
  };

  const handleSaveEditPill = (index) => {
    const trimmed = editingPillValue.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) {
      setOrigins((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      if (origins.some((item, idx) => idx !== index && item === trimmed)) {
        toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
        setFormErrors((prev) => ({
          ...prev,
          allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
        }));
        return;
      }
      setOrigins((prev) =>
        prev.map((item, idx) => (idx === index ? trimmed : item))
      );
      setFormErrors((prev) => ({ ...prev, allowedOrigins: null }));
    }
    setEditingPillIndex(null);
    setEditingPillValue("");
  };

  const handlePillEditKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSaveEditPill(index);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingPillIndex(null);
      setEditingPillValue("");
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error(
        isPublishable
          ? PUBLISHABLE_KEY.generation.descriptionRequired
          : API_KEY.generation.descriptionRequired
      );
      return;
    }
    const validationErrors = validate({ description });
    if (validationErrors.description) {
      setFormErrors({ apikey: validationErrors.description });
      return;
    }

    if (isPublishable && isOriginRestricted) {
      let finalOrigins = [...origins];
      if (originInputText.trim()) {
        const extra = originInputText.trim().replace(/^,+|,+$/g, "");
        if (extra) {
          if (finalOrigins.includes(extra)) {
            toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
            setFormErrors((prev) => ({
              ...prev,
              allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
            }));
            return;
          }
          finalOrigins.push(extra);
        }
      }
      if (finalOrigins.length === 0) {
        toast.error(PUBLISHABLE_KEY.generation.originRequired);
        setFormErrors((prev) => ({
          ...prev,
          allowedOrigins: PUBLISHABLE_KEY.generation.originRequired,
        }));
        return;
      }
      if (new Set(finalOrigins).size !== finalOrigins.length) {
        toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
        setFormErrors((prev) => ({
          ...prev,
          allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
        }));
        return;
      }
      if (!finalOrigins.every((o) => originRegex.test(o))) {
        toast.error(PUBLISHABLE_KEY.generation.invalidOrigin);
        setFormErrors((prev) => ({
          ...prev,
          allowedOrigins: PUBLISHABLE_KEY.generation.invalidOrigin,
        }));
        return;
      }
    }

    const success = await makeRequest();
    if (success) {
      setShowApiKeyModal(true);
      setDescription("");
      setOrigins([]);
      setOriginInputText("");
      setIsActive(true);
      setIsOriginRestricted(true);
      setFormErrors({});
      setFocusedField(null);
      toast.success(
        isPublishable
          ? PUBLISHABLE_KEY.generation.success
          : API_KEY.generation.success
      );
    }
  };

  const handleCopyKey = () => {
    const keyToCopy = data?.data?.publishable_key || data?.data?.api_key;
    if (keyToCopy && !copyMessage.trim()) {
      navigator.clipboard.writeText(keyToCopy).then(() => {
        setCopyMessage("Copied!");
      });
    }
  };

  const handleCloseModal = () => {
    setShowApiKeyModal(false);
    if (onKeyGenerated) {
      onKeyGenerated();
    }
  };

  const isFieldValid =
    Object.values(formErrors).every((error) => !error) ||
    Object.values(description).some((val) => !val);

  const isValidOrigins =
    !isPublishable ||
    (activeOrigins.length > 0 &&
      activeOrigins.every((o) => originRegex.test(o)));

  return (
    <>
      <div className={styles["card-header"]}>
        <div
          className={`${styles["key-icon"]} ${
            isPublishable ? styles["publishable-icon"] : ""
          }`}
        >
          {isPublishable ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          )}
        </div>
        <h2 className={styles["card-title"]}>
          {isPublishable ? "Generate Publishable Key" : "Generate Key"}
        </h2>
      </div>

      <p className={styles["card-description"]}>
        {isPublishable
          ? "Create a publishable key for client-side or public application requests."
          : "Create a unique key to authenticate your application requests securely."}
      </p>

      <form
        className={styles["api-key-form"]}
        noValidate
        onSubmit={handleGenerateKey}
      >
        <div className={styles["form-group"]}>
          <label htmlFor="description" className={styles["label"]}>
            Description
          </label>
          <CustomInput
            type="text"
            name="apikey"
            placeholder={
              isPublishable
                ? "e.g., Web App Publishable Key"
                : "e.g., Production API Key"
            }
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            disabled={loading}
            error={formErrors.apikey}
            onFocus={() => setFocusedField("apikey")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        {isPublishable && (
          <>
            <div className={styles["form-group"]}>
              <div className={styles["toggle-header"]}>
                <label className={styles["label"]}>Origin Restriction</label>
                <button
                  type="button"
                  role="switch"
                  aria-label="Origin Restriction"
                  aria-checked={isOriginRestricted}
                  className={`${styles["toggle-switch"]} ${
                    isOriginRestricted ? styles["toggle-active"] : ""
                  }`}
                  onClick={() => setIsOriginRestricted(!isOriginRestricted)}
                >
                  <span className={styles["toggle-thumb"]} />
                </button>
              </div>
              <p className={styles["toggle-subtitle"]}>
                {isOriginRestricted
                  ? "Restrict key usage to specified origin domains"
                  : "Allow key usage from any origin domain"}
              </p>
            </div>

            {isOriginRestricted && (
              <div className={styles["form-group"]}>
                <div className={styles["origins-list-header"]}>
                  <label className={styles["label"]}>Allowed Origins</label>
                  <span className={styles["origins-count"]}>
                    {activeOrigins.length}{" "}
                    {activeOrigins.length === 1 ? "origin" : "origins"}
                  </span>
                </div>
                <div className={styles["tag-input-box"]}>
                  {origins.map((origin, index) => (
                    <span key={index} className={styles["origin-pill"]}>
                      {editingPillIndex === index ? (
                        <input
                          type="text"
                          className={styles["pill-edit-input"]}
                          value={editingPillValue}
                          onChange={(e) => setEditingPillValue(e.target.value)}
                          onKeyDown={(e) => handlePillEditKeyDown(e, index)}
                          onBlur={() => handleSaveEditPill(index)}
                          autoFocus
                        />
                      ) : (
                        <>
                          <span
                            className={styles["pill-text"]}
                            onClick={() => handleStartEditPill(index, origin)}
                            title="Click to edit origin"
                          >
                            {origin}
                          </span>
                          <button
                            type="button"
                            className={styles["pill-remove-btn"]}
                            onClick={() => handleRemoveOriginTag(index)}
                            aria-label={`Remove origin ${origin}`}
                            title="Remove origin"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </>
                      )}
                    </span>
                  ))}
                  <input
                    type="text"
                    name="origin-tag-input"
                    className={styles["tag-input-field"]}
                    placeholder={
                      origins.length === 0
                        ? "e.g., https://example.com or http://localhost:8080"
                        : "Add origin..."
                    }
                    value={originInputText}
                    onChange={(e) => setOriginInputText(e.target.value)}
                    onKeyDown={handleOriginKeyDown}
                    onFocus={() => setFocusedField("originInputs")}
                    onBlur={handleOriginBlur}
                    disabled={loading}
                  />
                </div>

                {formErrors.allowedOrigins && (
                  <p className={styles["error-message"]}>
                    {formErrors.allowedOrigins}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className={styles["form-group"]}>
          <label htmlFor="expiry" className={styles["label"]}>
            Expiry Period
          </label>
          <Dropdown
            options={EXPIRY_KEYS_OPTION}
            selectedOption={String(expiresInDays)}
            setSelectedOption={(value) => setExpiresInDays(Number(value))}
            testId="testid-expiry-dropdown"
            className={styles["expiry-dropdown"]}
          />
        </div>

        <Button
          className={styles["submit-btn"]}
          variant="primary"
          type="submit"
          disabled={
            isGuest || !description.trim() || !isFieldValid || !isValidOrigins
          }
          isLoading={loading}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-testid="generate-key-btn"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          {isPublishable ? "Generate Publishable Key" : BUTTON_TEXT.generateKey}
        </Button>

        <Modal
          isOpen={showApiKeyModal}
          onClose={handleCloseModal}
          customWidth="500px"
        >
          <div className={styles["api-key-modal"]}>
            <h2>
              {isPublishable
                ? PUBLISHABLE_KEY.generation.modal.title
                : API_KEY.generation.modal.title}
            </h2>
            <p>
              {isPublishable
                ? PUBLISHABLE_KEY.generation.modal.warning
                : API_KEY.generation.modal.warning}
            </p>
            <div className={styles["key-display"]}>
              <code>{data?.data?.publishable_key || data?.data?.api_key}</code>
              <div className={styles["icon-wrapper"]}>
                <button
                  type="button"
                  className={styles["icon-button"]}
                  onClick={handleCopyKey}
                  aria-label="Copy API key"
                >
                  <img
                    src={copyMessage ? TICK.src : COPY.src}
                    className={styles["copy-icon"]}
                    alt="Copy API key"
                  />
                </button>
              </div>
            </div>

            {data?.data?.expires_at && (
              <div className={styles["expiry-info"]}>
                <p>
                  {isPublishable
                    ? PUBLISHABLE_KEY.generation.modal.expiryLabel
                    : API_KEY.generation.modal.expiryLabel}{" "}
                  {formatDate(data.data.expires_at)}
                </p>
              </div>
            )}
          </div>
        </Modal>
      </form>
    </>
  );
}

ApiKeyForm.propTypes = {
  isGuest: PropTypes.bool.isRequired,
  onKeyGenerated: PropTypes.func.isRequired,
  keyType: PropTypes.oneOf(["SECRET", "PUBLISHABLE"]),
};

export default ApiKeyForm;
