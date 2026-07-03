import Modal from "../common/modal/Modal.jsx";
import Button from "../common/button/Button.jsx";
import styles from "./ConfirmationModal.module.css";
import PropTypes from "prop-types";
import { CONFIRMATION_MODAL } from "../../utils/Constants.js";

function ConfirmationModal({
  isOpen,
  onClose,
  children,
  onConfirm,
  isConfirmDisabled = false,
  isConfirmLoading = false,
  confirmButtonContent,
  customHeading,
  customDescription,
  customWidth,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} customWidth={customWidth}>
      <form onSubmit={handleSubmit}>
        <h2 className={styles["confirm-modal-heading"]}>
          {customHeading || CONFIRMATION_MODAL.heading}
        </h2>
        <div className={styles["confirm-modal-description"]}>
          {customDescription || CONFIRMATION_MODAL.description}
        </div>
        {children}
        <div className={styles["confirm-modal-button-wrapper"]}>
          <Button type="button" variant="secondary" onClick={onClose}>
            {CONFIRMATION_MODAL.secondaryButtonText}
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={isConfirmDisabled}
            isLoading={isConfirmLoading}
          >
            {confirmButtonContent || CONFIRMATION_MODAL.primaryButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  isConfirmDisabled: PropTypes.bool,
  isConfirmLoading: PropTypes.bool,
  confirmButtonContent: PropTypes.node,
  customHeading: PropTypes.node,
  customDescription: PropTypes.node,
  customWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ConfirmationModal;
