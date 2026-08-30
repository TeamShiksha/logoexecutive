import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import styles from "./ImageUploadModal.module.css";
import {
  BUTTON_TEXT,
  IMAGE_UPLOAD_MODEL,
  MESSAGES,
  SVGS,
} from "../../utils/Constants";
import Modal from "../common/modal/Modal";
import CustomInput from "../common/input/CustomInput";
import Button from "../common/button/Button";
import { useToast } from "../../hooks/useToast";

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  isUpdate,
  isLoading,
  initialFile,
  initialCompanyUri,
}) => {
  const toast = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [companyUri, setCompanyUri] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        const reader = new FileReader();
        reader.onload = (fileRead) => {
          setSelectedImage({
            preview: fileRead.target.result,
            file: initialFile,
          });
        };
        reader.readAsDataURL(initialFile);
      }
      if (initialCompanyUri) {
        setCompanyUri(initialCompanyUri);
      }
    } else {
      setSelectedImage(null);
      setCompanyUri("");
    }
  }, [isOpen, initialFile, initialCompanyUri]);

  if (!isOpen) return null;

  const handleDrag = (dragEvent) => {
    dragEvent.preventDefault();
    dragEvent.stopPropagation();
    if (dragEvent.type === "dragenter" || dragEvent.type === "dragover") {
      setDragActive(true);
    } else if (dragEvent.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (dropEvent) => {
    dropEvent.preventDefault();
    dropEvent.stopPropagation();
    setDragActive(false);

    const file = dropEvent.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (inputChangeEvent) => {
    const file = inputChangeEvent.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && ["image/png"].includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (fileRead) => {
        setSelectedImage({
          preview: fileRead.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error(MESSAGES.UPLOAD_VALID_IMAGE);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedImage) return;
    if (!isUpdate && !companyUri) {
      toast.error(MESSAGES.UPLOAD_VALID_IMAGE);
      return;
    }
    onUpload({ file: selectedImage.file, ...(!isUpdate && { companyUri }) });
  };

  const onCloseModal = () => {
    onClose();
    setSelectedImage(null);
    setCompanyUri("");
  };

  const handleDropzoneKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      size="custom"
      customWidth="500px"
    >
      <div className={styles.modalHeader}>
        <h2>{isUpdate ? "Replace logo" : "Add logo"}</h2>
        <p>
          {isUpdate
            ? "Select a new image to replace the existing catalog logo."
            : "Upload a logo to add it to the catalog."}
        </p>
      </div>
      {selectedImage ? (
        <form className={styles.previewContainer} onSubmit={handleUpload}>
          <img
            src={selectedImage.preview}
            alt="Preview"
            className={styles.imagePreview}
          />
          <p>{selectedImage.file.name}</p>
          {!isUpdate && (
            <CustomInput
              type="text"
              name="companyUri"
              label="Company URI"
              value={companyUri}
              onChange={(e) => setCompanyUri(e.target.value)}
              className={styles.companyUriInput}
            />
          )}
          <Button
            className={styles.uploadButton}
            isLoading={isLoading}
            onClick={handleUpload}
          >
            {isUpdate ? "Replace logo" : BUTTON_TEXT.upload}
          </Button>
        </form>
      ) : (
        <div
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={handleDropzoneKeyDown}
          onClick={() => inputRef.current?.click()}
          aria-label="Image upload dropzone"
        >
          <div className={styles.dropzoneContent}>
            <div className={styles.imageIcon}>
              <img src={SVGS.dragAndDropBg} alt="Upload icon" />
            </div>
            <p>{IMAGE_UPLOAD_MODEL.dragAndDropImage}</p>
            <p className={styles.uploadHint}>
              {isUpdate
                ? "The existing logo will be replaced."
                : IMAGE_UPLOAD_MODEL.or}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <Button
              className={styles.selectButton}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              {BUTTON_TEXT.selectAnImage}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

ImageUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func,
  isUpdate: PropTypes.bool,
  isLoading: PropTypes.bool,
  initialFile: PropTypes.object,
  initialCompanyUri: PropTypes.string,
};

export default ImageUploadModal;
