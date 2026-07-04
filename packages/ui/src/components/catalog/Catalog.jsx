import { useEffect, useState, useRef } from "react";
import leftArrow from "../../assets/left-arrow.svg";
import rightArrow from "../../assets/right-arrow.svg";
import styles from "./Catalog.module.css";
import CatalogItem from "./CatalogItem";
import ImageUploadModal from "./ImageUploadModal";
import ImageRewardModal from "./ImageRewardModal";
import CustomInput from "../common/input/CustomInput";
import Button from "../common/button/Button";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import { MESSAGES } from "../../utils/Constants.js";
import axios from "axios";
import { processWebImage } from "../../utils/Helpers";

function Catalog() {
  const toast = useToast();
  const prevDataStringRef = useRef("");
  const [pageNum, setPageNum] = useState(0);
  const [showWebCatalog, setShowWebCatalog] = useState(false);
  const [showWebResults, setShowWebResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [updateImageId, setUpdateImageId] = useState(null);
  const [updatedImageCompanyUri, setUpdatedImageCompanyUri] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [preSelectedFile, setPreSelectedFile] = useState(null);
  const [preFilledUri, setPreFilledUri] = useState("");
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardImageId, setRewardImageId] = useState(null);
  const [rewardImageName, setRewardImageName] = useState("");
  const [rewardUserId, setRewardUserId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 700);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const pageBeforeSearchRef = useRef(0);
  const limit = 10;
  const skip = pageNum * limit;

  const { data, loading, makeRequest, errorMsg } = useApi({
    method: "GET",
    url: `/catalog/logos?skip=${skip}&limit=${limit}&search=${debouncedSearchTerm}`,
  });

  const { makeRequest: uploadMakeRequest, errorMsg: uploadErrorMsg } = useApi({
    method: updateImageId ? "PUT" : "POST",
    url: `/catalog/logo`,
    headers: { "Content-Type": "application/json" },
  });

  const { fetchRequest, errorMsg: fetchErrMsg } = useApi({
    method: "POST",
    url: `/catalog/signed-url`,
  });

  useEffect(() => {
    if (debouncedSearchTerm.length === 0 || debouncedSearchTerm.length >= 2) {
      makeRequest();
    }
  }, [pageNum, debouncedSearchTerm, makeRequest]);

  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    if (data?.source === "web-search") {
      if (currentDataString !== prevDataStringRef.current) {
        setShowWebCatalog(true);
        setShowWebResults(false);
        prevDataStringRef.current = currentDataString;
      }
    } else {
      setShowWebCatalog(false);
      setShowWebResults(false);
    }
  }, [data]);

  useEffect(() => {
    if (fetchErrMsg) {
      toast.error(fetchErrMsg);
    }
  }, [fetchErrMsg, toast]);

  useEffect(() => {
    if (uploadErrorMsg) {
      toast.error(uploadErrorMsg);
    }
  }, [uploadErrorMsg, toast]);

  useEffect(() => {
    if (errorMsg) {
      toast.error(errorMsg);
    }
  }, [errorMsg, toast]);

  useEffect(() => {
    if (data?.data?.totalPages) {
      setTotalPages(data.data.totalPages - 1);
    }
  }, [data]);

  const handleImageUpload = async ({ file, companyUri }) => {
    if (!file || !companyUri) {
      toast.error(MESSAGES.UPLOAD_VALID_IMAGE);
      return;
    }
    setUploadLoading(true);
    const extension = file.name.split(".").pop().toLowerCase();
    const size = file.size;

    try {
      const { success, data: uploadResp } = await fetchRequest({
        data: {
          companyUri,
          extension,
          type: "upload",
        },
      });
      if (!success || !uploadResp) {
        throw new Error("Failed to proceed your request");
      }
      const { data } = uploadResp;
      const { presignedUrl, key } = data;

      if (!presignedUrl || !key) {
        throw new Error("Presigned url or key is missing");
      }
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      const metadataSaved = await uploadMakeRequest({
        data: { companyUri, extension, size },
      });
      if (metadataSaved) {
        setIsModalOpen(false);
        setUpdateImageId(null);
        setPreSelectedFile(null);
        setPreFilledUri("");
        toast.success(MESSAGES.IMAGE_UPLOAD_SUCCESS);
        makeRequest();
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err?.response?.data?.message) {
        toast.error(err?.response?.data?.message);
      } else {
        toast.error(MESSAGES.IMAGE_UPLOAD_ERROR);
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateImage = async ({ file }) => {
    if (!file || !updateImageId) {
      toast.error(MESSAGES.IMAGE_UPDATE_ERROR);
      return;
    }
    setUploadLoading(true);

    const extension = file.name.split(".").pop().toLowerCase();
    const size = file.size;

    try {
      const { success, data: uploadResp } = await fetchRequest({
        data: {
          companyUri: updatedImageCompanyUri,
          extension: extension,
          type: "update",
        },
      });
      if (!success || !uploadResp) {
        throw new Error("Failed to proceed your request");
      }
      const { data } = uploadResp;
      const { presignedUrl, key } = data;

      if (!presignedUrl || !key) {
        throw new Error("Presigned url or key is missing");
      }

      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      const metadataSaved = await uploadMakeRequest({
        data: {
          companyUri: updatedImageCompanyUri,
          extension: extension,
          size: size,
          id: updateImageId,
        },
      });

      if (metadataSaved) {
        setIsModalOpen(false);
        setUpdateImageId(null);
        toast.success(MESSAGES.IMAGE_UPDATE_SUCCESS);
        makeRequest();
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(MESSAGES.IMAGE_UPDATE_ERROR);
    } finally {
      setUploadLoading(false);
    }
  };
  const handleWebResultUpload = async (img) => {
    try {
      setUploadLoading(true);
      const pngFile = await processWebImage(
        img.url,
        img.companyName,
        img.bufferBase64,
        img.extension || img.mimeType
      );
      setUpdateImageId(null);
      setUpdatedImageCompanyUri(null);
      setPreSelectedFile(pngFile);
      setPreFilledUri(img.companyUri || "");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch logo from web search:", error);
      toast.error("Failed to convert or load logo. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSearchTermChange = (inputChangeEvent) => {
    const newSearchTerm = inputChangeEvent.target.value;
    const previousSearchTerm = searchTerm;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length >= 2 && previousSearchTerm.length < 2) {
      pageBeforeSearchRef.current = pageNum;
      setPageNum(0);
    } else if (newSearchTerm.length >= 2 && previousSearchTerm.length >= 2) {
      setPageNum(0);
    } else if (newSearchTerm.length < 2 && previousSearchTerm.length >= 2) {
      setPageNum(pageBeforeSearchRef.current);
    }
  };
  const handleSearchOnWeb = () => {
    setShowWebCatalog(false);
    setShowWebResults(true);
  };

  const handlePreviousBtnClick = () => {
    if (pageNum > 0) {
      setPageNum((prev) => prev - 1);
    }
  };

  const handleNextBtnClick = () => {
    if (pageNum < totalPages) {
      setPageNum((prev) => prev + 1);
    }
  };
  const handleReuploadBtnClick = (id, companyuri) => {
    setIsModalOpen(true);
    setUpdateImageId(id);
    setUpdatedImageCompanyUri(companyuri);
  };

  const handleViewRewardsClick = (id, imageName, userId) => {
    setRewardImageId(id);
    setRewardImageName(imageName);
    setRewardUserId(userId);
    setIsRewardModalOpen(true);
  };

  return (
    <div className={styles["catalog-wrapper"]} data-testid="catalog">
      <div className={styles["catalog-search"]}>
        <CustomInput
          name="search"
          type="search"
          label="search"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        <Button
          onClick={() => {
            setUpdateImageId(null);
            setPreSelectedFile(null);
            setPreFilledUri("");
            setIsModalOpen(true);
          }}
          variant="primary"
          className={styles["catalog-add-image-btn"]}
        >
          Add image
        </Button>
        <ImageUploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setUpdateImageId(null);
            setIsModalOpen(false);
            setPreSelectedFile(null);
            setPreFilledUri("");
          }}
          onUpload={updateImageId ? handleUpdateImage : handleImageUpload}
          isUpdate={!!updateImageId}
          isLoading={uploadLoading}
          initialFile={preSelectedFile}
          initialCompanyUri={preFilledUri}
        />
      </div>
      {showWebCatalog && data?.source === "web-search" && (
        <div className={styles["catalog-search-modal"]}>
          <div className={styles["catalog-search-modal-header"]}>
            Image Not Found
            <button
              type="button"
              className={styles["catalog-search-modal-cross"]}
              onClick={() => setShowWebCatalog(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className={styles["web-search-catalog-body"]}>
            <p>We couldn’t find this image in our catalog.</p>

            <div className={styles["web-search-actions"]}>
              <Button
                variant="primary"
                onClick={() => {
                  setPreSelectedFile(null);
                  setPreFilledUri("");
                  setIsModalOpen(true);
                  setUpdateImageId(null);
                }}
              >
                ADD IMAGE
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  handleSearchOnWeb();
                }}
              >
                Search on Web
              </Button>
            </div>
          </div>
        </div>
      )}
      {showWebResults &&
        data?.source === "web-search" &&
        data?.data?.length > 0 && (
          <div className={styles["catalog-search-modal"]}>
            <div className={styles["catalog-search-modal-header"]}>
              <div className={styles["catalog-search-modal-title"]}>
                Suggested Images
              </div>
              <button
                type="button"
                className={styles["catalog-search-modal-cross"]}
                onClick={() => setShowWebResults(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {data?.data?.map((img) => (
              <div
                key={img.url || img.companyUri}
                className={styles["search-modal-row"]}
              >
                <img
                  src={img.url}
                  alt={img.companyName}
                  width={40}
                  height={40}
                  className={styles["search-modal-img"]}
                />
                <div className={styles["search-modal-company-name"]}>
                  {img.companyName || "Unknown"}
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleWebResultUpload(img)}
                >
                  Upload
                </Button>
              </div>
            ))}
          </div>
        )}
      <div className={styles["catalog-table-wrapper"]}>
        <div className={styles["catalog-table-header"]}>
          <div className={styles["catalog-table-column-first"]}>Images</div>
          <div className={styles["catalog-table-header-inner"]}>
            <div>Created</div>
            <div>Updated</div>
          </div>
          <div className={styles["catalog-table-column-last"]}></div>
        </div>

        <div className={styles["catalog-table-content"]}>
          {loading && (
            <div className={styles["catalog-loading-spinner"]}>
              <LoadingSpinner color="blue" />
            </div>
          )}

          {!loading && data?.data?.data?.length === 0 && (
            <p className={styles["catalog-table-no-content"]}>
              {MESSAGES.NO_RESULT_FOUND}
            </p>
          )}

          {!loading &&
            data?.data?.data?.length > 0 &&
            data.data.data.map((company) => (
              <CatalogItem
                key={company._id}
                company={company}
                onUpdate={handleReuploadBtnClick}
                onViewRewards={handleViewRewardsClick}
              />
            ))}
        </div>

        <div className={styles["catalog-table-footer"]}>
          <button
            onClick={handlePreviousBtnClick}
            disabled={pageNum === 0}
            aria-label="Previous page"
            className={`${styles["catalog-footer-nav-btn"]} ${styles["catalog-nav-left-arrow"]} ${pageNum === 0 ? styles["catalog-footer-nav-btn-disable"] : ""}`}
          >
            <img src={leftArrow} alt="left-arrow" aria-hidden="true" />
          </button>
          <div>
            Page{" "}
            <span data-testid="current-page" className={styles["cur-page"]}>
              {pageNum + 1}
            </span>{" "}
            of {totalPages + 1}
          </div>
          <button
            onClick={handleNextBtnClick}
            disabled={pageNum === totalPages}
            aria-label="Next page"
            className={`${styles["catalog-footer-nav-btn"]} ${styles["catalog-nav-right-arrow"]} ${pageNum === totalPages ? styles["catalog-footer-nav-btn-disable"] : ""}`}
          >
            <img src={rightArrow} alt="right-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ImageRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setRewardImageId(null);
          setRewardImageName("");
          setRewardUserId(null);
        }}
        imageId={rewardImageId}
        imageName={rewardImageName}
        userId={rewardUserId}
      />
    </div>
  );
}

export default Catalog;
