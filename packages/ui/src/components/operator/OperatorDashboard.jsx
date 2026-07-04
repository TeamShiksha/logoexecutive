import { useState, useEffect, useCallback } from "react";
import operatorStyles from "./OperatorDashboard.module.css";
import Modal from "../common/modal/Modal";
import OperatorCard from "../operatorcard/OperatorCard";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner";
import { instance } from "../../api/api_instance";
import { validate, processWebImage } from "../../utils/Helpers";
import Button from "../common/button/Button";
import { useToast } from "../../hooks/useToast";
import { BUTTON_TEXT, MESSAGES, MODAL_MESSAGES } from "../../utils/Constants";
import Dropdown from "../common/dropdown/Dropdown";
import ImageUploadModal from "../catalog/ImageUploadModal";
import CustomInput from "../common/input/CustomInput";
import { useApi } from "../../hooks/useApi";
import axios from "axios";
import PropTypes from "prop-types";

const createPayload = (searchType, responseText, responseAction) => {
  const status = responseAction === "respond" ? "RESOLVED" : "REJECTED";
  if (searchType === "messages") {
    return { reply: responseText, status };
  } else {
    return { comment: responseText, status };
  }
};

const showSuccessToast = (toast, searchType, responseAction) => {
  if (searchType === "messages") {
    if (responseAction === "respond") {
      toast.success("Responded to message successfully.");
    } else {
      toast.success("Message rejected successfully.");
    }
  } else if (searchType === "requests") {
    if (responseAction === "respond") {
      toast.success("Request marked as resolved successfully.");
    } else {
      toast.success("Request rejected successfully.");
    }
  } else {
    if (responseAction === "respond") {
      toast.success("Logo created successfully.");
    } else {
      toast.success("Logo rejected successfully.");
    }
  }
};

const Operator = ({
  selectedDashboard,
  dashboardDropdownOptions,
  isDropdownOpen,
  setIsDropdownOpen,
  handleRoleSelect,
  headerStyles,
}) => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchType, setSearchType] = useState("messages");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [responseAction, setResponseAction] = useState("respond");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const toast = useToast();
  const OperatorDashboardDropdownOptions = ["messages", "requests", "logos"];

  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showWebCatalog, setShowWebCatalog] = useState(false);
  const [showWebResults, setShowWebResults] = useState(false);
  const [showDbResults, setShowDbResults] = useState(false);
  const [preSelectedFile, setPreSelectedFile] = useState(null);
  const [preFilledUri, setPreFilledUri] = useState("");
  const [updateImageId, setUpdateImageId] = useState(null);
  const [updatedImageCompanyUri, setUpdatedImageCompanyUri] = useState(null);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (searchTerm.length < 2) {
      setDebouncedSearchTerm("");
      setShowWebCatalog(false);
      setShowWebResults(false);
      setShowDbResults(false);
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const {
    data: searchData,
    makeRequest: searchMakeRequest,
    loading: searchLoading,
  } = useApi({
    method: "GET",
    url: `/catalog/logos?skip=0&limit=10&search=${debouncedSearchTerm}`,
  });

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      searchMakeRequest();
    }
  }, [debouncedSearchTerm, searchMakeRequest]);

  useEffect(() => {
    if (searchData?.source === "web-search") {
      setShowWebCatalog(true);
      setShowWebResults(false);
      setShowDbResults(false);
    } else if (searchData?.source === "db-search") {
      setShowWebCatalog(false);
      setShowWebResults(false);
      setShowDbResults(true);
    }
  }, [searchData, debouncedSearchTerm]);

  const fetchMessages = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await instance.get("/messages", {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            tab: activeTab,
          },
        });
        setMessages(response.data.results);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  const fetchRequests = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await instance.get("/requests", {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            tab: activeTab,
          },
        });
        setRequests(response.data.results);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  const fetchLogos = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await instance.get("/create-logo-request", {
          params: {
            page,
            limit: ITEMS_PER_PAGE,
            tab: activeTab,
          },
        });
        setLogos(response.data.results);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching logos:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  const handleResponseSubmit = async () => {
    if (!currentItem) return;
    const payload = createPayload(searchType, responseText, responseAction);

    setLoading(true);
    try {
      let endpoint = null;
      let refreshData = null;
      if (searchType === "messages") {
        endpoint = `/messages/${currentItem._id}`;
        refreshData = fetchMessages;
      } else if (searchType === "requests") {
        endpoint = `/requests/${currentItem._id}`;
        refreshData = fetchRequests;
      } else {
        endpoint = `/create-logo-request/${currentItem._id}`;
        refreshData = fetchLogos;
      }

      await instance.put(endpoint, payload);
      refreshData(currentPage);

      setIsModalOpen(false);
      setCurrentItem(null);
      setResponseText("");
      setFormErrors({});

      showSuccessToast(toast, searchType, responseAction);
    } catch (err) {
      console.error("Error sending response:", err);
      setFormErrors({ message: "Error sending response" });
      toast.error("Failed to send response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchType === "messages") {
      fetchMessages(currentPage);
    } else if (searchType === "requests") {
      fetchRequests(currentPage);
    } else {
      fetchLogos(currentPage);
    }
  }, [
    searchType,
    currentPage,
    activeTab,
    fetchMessages,
    fetchRequests,
    fetchLogos,
  ]);

  useEffect(() => {
    if (!focusedField) {
      if (responseText) {
        const errors = validate({ message: responseText });
        setFormErrors(errors);
      } else {
        setFormErrors({});
      }
      return;
    }

    const timeout = setTimeout(() => {
      const validationErrors = validate({
        [focusedField]: responseText,
      });
      setFormErrors(validationErrors);
    }, 500);

    return () => clearTimeout(timeout);
  }, [focusedField, responseText]);

  useEffect(() => {
    const errors = validate({ message: responseText });
    setIsFormValid(Object.keys(errors).length === 0);
  }, [responseText]);

  const filterItemsByStatus = (items) => {
    return items.filter((item) => {
      if (activeTab === "active") {
        return ["PENDING"].includes(item.status);
      }
      return ["COMPLETED", "RESOLVED", "REJECTED"].includes(item.status);
    });
  };

  const getFilteredData = () => {
    if (searchType === "messages") {
      return filterItemsByStatus(messages);
    } else if (searchType === "requests") {
      return filterItemsByStatus(requests);
    } else {
      return filterItemsByStatus(logos);
    }
  };

  const filteredData = getFilteredData();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleRespondClick = (item, actionType = "respond") => {
    setCurrentItem(item);
    setResponseAction(actionType);
    setResponseText(item.comment || "");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleResponseChange = (e) => {
    setResponseText(e.target.value);
  };

  const { makeRequest: uploadMakeRequest, errorMsg: uploadErrorMsg } = useApi({
    method: "POST",
    url: `/catalog/logo`,
    headers: { "Content-Type": "application/json" },
  });

  const { fetchRequest: getPresignedURLRequest, errorMsg: fetchErrMsg } =
    useApi({
      method: "POST",
      url: `/catalog/signed-url`,
    });

  useEffect(() => {
    if (uploadErrorMsg) {
      toast.error(uploadErrorMsg);
    }
  }, [uploadErrorMsg, toast]);

  useEffect(() => {
    if (fetchErrMsg) {
      toast.error(fetchErrMsg);
    }
  }, [fetchErrMsg, toast]);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchOnWeb = () => {
    setShowWebCatalog(false);
    setShowWebResults(true);
  };

  const handleWebResultUpload = async (img) => {
    try {
      setLoading(true);
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
      setIsUploadModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch logo from web search:", error);
      toast.error("Failed to load logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async ({ file, companyUri }) => {
    if (!file || !companyUri) {
      toast.error(MESSAGES.UPLOAD_VALID_IMAGE);
      return;
    }
    setUploadLoading(true);
    const extension = file.name.split(".").pop().toLowerCase();
    const size = file.size;

    try {
      const { success, data: uploadResp } = await getPresignedURLRequest({
        data: {
          companyUri,
          extension,
          type: "upload",
        },
      });
      if (!success || !uploadResp) {
        toast.error("Failed to proceed your request");
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
        setIsUploadModalOpen(false);
        setPreSelectedFile(null);
        setPreFilledUri("");
        toast.success(MESSAGES.IMAGE_UPLOAD_SUCCESS);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(MESSAGES.IMAGE_UPLOAD_ERROR);
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
      const { success, data: uploadResp } = await getPresignedURLRequest({
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
        setIsUploadModalOpen(false);
        setUpdateImageId(null);
        setPreSelectedFile(null);
        setPreFilledUri("");
        toast.success(MESSAGES.IMAGE_UPDATE_SUCCESS);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(MESSAGES.IMAGE_UPDATE_ERROR);
    } finally {
      setUploadLoading(false);
    }
  };

  let modalTitle;
  if (responseAction === "respond") {
    if (searchType === "messages") {
      modalTitle = "Respond to Message";
    } else {
      modalTitle = "Respond to Request";
    }
  } else if (searchType === "messages") {
    modalTitle = "Reject Message";
  } else {
    modalTitle = "Reject Request";
  }

  let submitButtonText;
  if (responseAction === "respond") {
    submitButtonText = BUTTON_TEXT.sendResponse;
  } else {
    submitButtonText = BUTTON_TEXT.confirmRejection;
  }

  let contentToRender;
  if (loading) {
    contentToRender = (
      <div className={operatorStyles["loading-container"]}>
        <LoadingSpinner size={40} color="black" />
      </div>
    );
  } else if (filteredData.length === 0) {
    contentToRender = (
      <div className={operatorStyles["empty-state"]}>
        No {searchType} found for this filter.
      </div>
    );
  } else {
    contentToRender = (
      <div className={operatorStyles["cards-container"]}>
        {filteredData.map((item) => (
          <OperatorCard
            key={item._id}
            item={item}
            searchType={searchType}
            onRespondClick={handleRespondClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className={headerStyles["page-header"]}>
        <div className={headerStyles["title-section"]}>
          <h1 className={headerStyles["dashboard-title"]}>
            Operator Dashboard
          </h1>
          <p className={headerStyles["dashboard-subtitle"]}>
            Monitor operations and manage system resources.
          </p>
        </div>

        <div className={headerStyles["header-right"]}>
          <div className={headerStyles["dropdown-wrapper"]}>
            <button
              className={headerStyles["dropdown"]}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedDashboard}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className={headerStyles["dropdown-menu"]}>
                {dashboardDropdownOptions.map((option) => (
                  <div
                    key={option}
                    className={headerStyles["dropdown-item"]}
                    onClick={() => handleRoleSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={operatorStyles["operator-container"]}>
        <div className={operatorStyles["catalog-search"]}>
          <CustomInput
            name="search"
            type="search"
            label="Search"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <Button
            onClick={() => {
              setPreSelectedFile(null);
              setPreFilledUri("");
              setIsUploadModalOpen(true);
            }}
            variant="primary"
            className={operatorStyles["catalog-add-image-btn"]}
          >
            Add image
          </Button>
          <ImageUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => {
              setIsUploadModalOpen(false);
              setPreSelectedFile(null);
              setPreFilledUri("");
              setUpdateImageId(null);
              setUpdatedImageCompanyUri(null);
            }}
            onUpload={updateImageId ? handleUpdateImage : handleImageUpload}
            isUpdate={!!updateImageId}
            isLoading={uploadLoading}
            initialFile={preSelectedFile}
            initialCompanyUri={preFilledUri}
          />
        </div>
        {searchLoading && (
          <div
            className={operatorStyles["loading-container"]}
            style={{ marginTop: "20px" }}
          >
            <LoadingSpinner size={20} color="rgba(45, 8, 193, 1)" />
          </div>
        )}
        {showWebCatalog && searchData?.source === "web-search" && (
          <div className={operatorStyles["catalog-search-modal"]}>
            <div className={operatorStyles["catalog-search-modal-header"]}>
              <div className={operatorStyles["catalog-search-modal-title"]}>
                Image Not Found in DB
              </div>
              <div
                className={operatorStyles["catalog-search-modal-cross"]}
                onClick={() => setShowWebCatalog(false)}
              >
                ✕
              </div>
            </div>
            <div className={operatorStyles["web-search-catalog-body"]}>
              <p>We could not find this image in our catalog database.</p>
              <div className={operatorStyles["web-search-actions"]}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setPreSelectedFile(null);
                    setPreFilledUri("");
                    setIsUploadModalOpen(true);
                  }}
                >
                  ADD IMAGE
                </Button>
                <Button variant="secondary" onClick={handleSearchOnWeb}>
                  Search on Web
                </Button>
              </div>
            </div>
          </div>
        )}

        {showWebResults &&
          searchData?.source === "web-search" &&
          searchData?.data?.length > 0 && (
            <div className={operatorStyles["catalog-table-wrapper"]}>
              <div className={operatorStyles["catalog-table-header"]}>
                <div className={operatorStyles["catalog-table-column-first"]}>
                  Image
                </div>
                <div
                  className={operatorStyles["catalog-table-column-last"]}
                ></div>
              </div>

              <div className={operatorStyles["operator-catalog-list"]}>
                {searchData.data.map((img, index) => (
                  <div
                    key={img.companyUri || img.url || index}
                    className={operatorStyles["operator-catalog-row"]}
                  >
                    <div className={operatorStyles["operator-catalog-left"]}>
                      <div className={operatorStyles["catalog-item-img"]}>
                        <img src={img.url} alt={img.companyName || "image"} />
                      </div>
                      <div className={operatorStyles["operator-catalog-name"]}>
                        {(img.companyName || "unknown").toLowerCase()}
                      </div>
                    </div>
                    <div className={operatorStyles["operator-catalog-actions"]}>
                      <Button
                        onClick={() => handleWebResultUpload(img)}
                        variant="primary"
                        className={operatorStyles["reupload-btn"]}
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {showDbResults &&
          searchData?.source === "db-search" &&
          searchData?.data?.data?.length > 0 && (
            <div className={operatorStyles["catalog-table-wrapper"]}>
              <div className={operatorStyles["catalog-table-header"]}>
                <div className={operatorStyles["catalog-table-column-first"]}>
                  Images
                </div>
                <div
                  className={operatorStyles["catalog-table-column-last"]}
                ></div>
              </div>

              <div className={operatorStyles["operator-catalog-list"]}>
                {searchData.data.data.map((company) => (
                  <div
                    key={company._id}
                    className={operatorStyles["operator-catalog-row"]}
                  >
                    <div className={operatorStyles["operator-catalog-left"]}>
                      <div className={operatorStyles["catalog-item-img"]}>
                        <div
                          className={operatorStyles["catalog-item-initials"]}
                        >
                          {company.company_name
                            ? company.company_name[0].toUpperCase()
                            : "#"}
                        </div>
                      </div>
                      <div className={operatorStyles["operator-catalog-name"]}>
                        {company.company_name.toLowerCase()}.{company.extension}
                      </div>
                    </div>
                    <div className={operatorStyles["operator-catalog-actions"]}>
                      <Button
                        onClick={() => {
                          setPreSelectedFile(null);
                          setPreFilledUri(company.company_uri || "");
                          setUpdateImageId(company._id);
                          setUpdatedImageCompanyUri(company.company_uri || "");
                          setIsUploadModalOpen(true);
                        }}
                        variant="primary"
                        className={operatorStyles["reupload-btn"]}
                      >
                        Reupload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className={operatorStyles.header}>
          <div className={operatorStyles["tabs-container"]}>
            <button
              className={`${operatorStyles["tab-button"]} ${activeTab === "active" ? operatorStyles["active-tab"] : ""}`}
              onClick={() => handleTabChange("active")}
            >
              Active
            </button>
            <button
              className={`${operatorStyles["tab-button"]} ${activeTab === "archived" ? operatorStyles["active-tab"] : ""}`}
              onClick={() => handleTabChange("archived")}
            >
              Archived
            </button>
          </div>
          <Dropdown
            options={OperatorDashboardDropdownOptions}
            selectedOption={searchType}
            setSelectedOption={setSearchType}
            className={operatorStyles["type-selector"]}
          />
        </div>

        {contentToRender}

        {totalPages > 1 && (
          <div className={operatorStyles.pagination}>
            <button
              className={operatorStyles["page-button"]}
              disabled={currentPage === 1 || loading}
              onClick={goToPreviousPage}
            >
              &laquo;
            </button>
            <span className={operatorStyles["page-indicator"]}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={operatorStyles["page-button"]}
              disabled={currentPage === totalPages || loading}
              onClick={goToNextPage}
            >
              &raquo;
            </button>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormErrors({});
          }}
          customWidth="350px"
          closeOnOverlayClick={!loading}
          showCloseButton={!loading}
          customClass={operatorStyles["response-modal"]}
        >
          <h2>{modalTitle}</h2>

          <div className={operatorStyles["response-field"]}>
            <textarea
              id="response"
              name="message"
              value={responseText}
              onChange={handleResponseChange}
              rows={2}
              placeholder={
                responseAction === "respond"
                  ? MODAL_MESSAGES.RESPOND
                  : MODAL_MESSAGES.REJECT
              }
              disabled={loading}
              onFocus={() => setFocusedField("message")}
              onBlur={() => setFocusedField(null)}
            />
            <div className={operatorStyles["character-limit"]}>
              <p>
                {`[${responseText.length}/` +
                  MODAL_MESSAGES.CHARACTER_LIMIT +
                  `]`}
              </p>
            </div>
            <div
              className={`${operatorStyles["error-container"]} ${formErrors.message ? "has-error" : ""}`}
            >
              <p className="input-error">{formErrors.message}</p>
            </div>
          </div>

          <div className={operatorStyles["modal-actions"]}>
            <Button
              onClick={handleResponseSubmit}
              disabled={!isFormValid || loading}
              variant={responseAction === "respond" ? "primary" : "danger"}
              className={operatorStyles["send-button"]}
              isLoading={loading}
            >
              {submitButtonText}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

Operator.propTypes = {
  selectedDashboard: PropTypes.string.isRequired,
  dashboardDropdownOptions: PropTypes.array.isRequired,
  isDropdownOpen: PropTypes.bool.isRequired,
  setIsDropdownOpen: PropTypes.func.isRequired,
  handleRoleSelect: PropTypes.func.isRequired,
  headerStyles: PropTypes.object.isRequired,
};

export default Operator;
