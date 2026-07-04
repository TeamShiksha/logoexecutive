import PropTypes from "prop-types";
import { X } from "lucide-react";
import { BUTTON_TEXT } from "../../../utils/Constants";
import styles from "./Modal.module.css";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({
  isOpen,
  onClose,
  children,
  customWidth,
  customHeight,
  customClass,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (clickEvent) => {
    if (clickEvent.target === clickEvent.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const handleKeyDown = (keyEvent) => {
    if (
      keyEvent.target === keyEvent.currentTarget &&
      (keyEvent.key === "Enter" || keyEvent.key === " ") &&
      closeOnOverlayClick
    ) {
      keyEvent.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <div
      data-testid="modal-overlay"
      className={styles["modal-overlay"]}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close modal overlay"
    >
      <div
        data-testid="dialog"
        className={`${styles.modal} ${customClass || ""}`}
        style={{
          ...(customWidth ? { width: customWidth } : {}),
          ...(customHeight ? { height: customHeight } : {}),
        }}
      >
        {showCloseButton && (
          <button
            className={styles["close-button"]}
            onClick={onClose}
            aria-label={BUTTON_TEXT.cross}
          >
            <X size={18} />
            <span className={styles["sr-only"]}>{BUTTON_TEXT.cross}</span>
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  customWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  customHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  customClass: PropTypes.string,
  customStyles: PropTypes.object,
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
};

export default Modal;
