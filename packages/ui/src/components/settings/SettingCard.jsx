import styles from "./SettingCard.module.css";
import Button from "../common/button/Button";
import {
  DELETE_ACCOUNT_MODAL,
  EMAIL_DOES_NOT_EXIST,
  MESSAGES,
  SETTING,
} from "../../utils/Constants";
import PropTypes from "prop-types";
import CustomInput from "../common/input/CustomInput";
import { useContext, useEffect, useState } from "react";
import { AuthContext, UserContext } from "../../contexts/Contexts";
import ConfirmationModal from "../confirm/ConfirmationModal";
import { useToast } from "../../hooks/useToast";
import { useApi } from "../../hooks/useApi";

function SettingCard({ isGuest }) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [email, setEmail] = useState("");
  const { userData } = useContext(UserContext);
  const { setIsAuthenticated } = useContext(AuthContext);
  const toast = useToast();

  const { makeRequest, errorMsg } = useApi({
    method: "DELETE",
    url: "/user/me",
    data: {
      userData,
    },
  });

  const { fetchRequest: downloadRequest, errorMsg: downloadError } = useApi();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (errorMsg) toast.error(errorMsg);
  }, [errorMsg, toast]);

  useEffect(() => {
    if (downloadError) toast.error(downloadError);
  }, [downloadError, toast]);

  const handleDeleteConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleDeleteAccount = async () => {
    if (email !== userData?.email) {
      toast.error(EMAIL_DOES_NOT_EXIST.MESSAGE);
      return;
    }
    setIsDeleting(true);
    try {
      const success = await makeRequest();
      if (success) {
        setEmail("");
        setShowConfirmationModal(false);
        toast.success(MESSAGES.ACCOUNT_DELETE_SUCCESS);
        setIsAuthenticated(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      const { success, data, error } = await downloadRequest({
        url: "/user/download",
        method: "GET",
        responseType: "blob",
      });

      if (success && data) {
        const blob = new Blob([data], { type: "application/json" });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute(
          "download",
          `openlogo_data_${userData?.userId || "export"}.json`
        );
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(error || "Failed to download data.");
      }
    } catch (err) {
      toast.error("An unexpected error occured during download");
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleActionItem = (action) => {
    if (action === "delete") {
      handleDeleteConfirmation();
    } else if (action === "download") {
      handleDownloadData();
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    setEmail("");
  };

  return (
    <div className={styles["settings-container"]}>
      {SETTING.map((setting, index) => (
        <div key={index} className={styles["action-section"]}>
          <p className={styles["action-text"]}>{setting.subtitle}</p>
          <Button
            type="submit"
            variant={
              setting.buttontitle.toLowerCase().includes("delete")
                ? "danger"
                : "primary"
            }
            className={styles["action-button"]}
            disabled={
              isGuest || (setting.action === "download" && isDownloading)
            }
            onClick={() => handleActionItem(setting.action)}
          >
            {setting.action === "download" && isDownloading
              ? "Downloading..."
              : setting.buttontitle}
          </Button>
        </div>
      ))}
      {showConfirmationModal && (
        <div data-testid="delete-account-modal">
          <ConfirmationModal
            isOpen={showConfirmationModal}
            onClose={handleCloseModal}
            onConfirm={handleDeleteAccount}
            isConfirmDisabled={!email || userData.email !== email}
            isConfirmLoading={isDeleting}
            confirmButtonContent={DELETE_ACCOUNT_MODAL.primaryButtonText}
            customHeading={DELETE_ACCOUNT_MODAL.title}
            customDescription={DELETE_ACCOUNT_MODAL.subText}
          >
            <CustomInput
              type="email"
              name="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </ConfirmationModal>
        </div>
      )}
    </div>
  );
}

SettingCard.propTypes = {
  isGuest: PropTypes.bool.isRequired,
};

export default SettingCard;
