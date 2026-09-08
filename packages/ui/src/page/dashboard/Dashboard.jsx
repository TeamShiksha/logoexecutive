import { useContext, useEffect, useMemo, useState } from "react";
import { instance } from "../../api/api_instance";
import AdminDashboard from "../../components/admin/AdminDashboard.jsx";
import ApiKeyForm from "../../components/apikeyform/ApiKeyForm";
import Button from "../../components/common/button/Button.jsx";
import CustomInput from "../../components/common/input/CustomInput.jsx";
import LoadingSpinner from "../../components/common/loadingspinner/LoadingSpinner.jsx";
import Modal from "../../components/common/modal/Modal.jsx";
import Table from "../../components/common/table/Table.jsx";
import ConfirmationModal from "../../components/confirm/ConfirmationModal.jsx";
import Graph from "../../components/graph/Graph.jsx";
import InformationModal from "../../components/information/InformationModal.jsx";
import OperatorDashboard from "../../components/operator/OperatorDashboard.jsx";
import UserRewardsDashboard from "../../components/rewards/UserRewardsDashboard.jsx";
import Usage from "../../components/usage/Usage";
import { UserContext } from "../../contexts/Contexts.jsx";
import { useApi } from "../../hooks/useApi.js";
import { useToast } from "../../hooks/useToast.js";
import {
  API_KEY,
  API_KEY_TABLE,
  BUTTON_TEXT,
  PUBLISHABLE_KEY,
  PUBLISHABLE_KEY_TABLE,
} from "../../utils/Constants.js";
import { formatDate } from "../../utils/Helpers";
import styles from "./Dashboard.module.css";

const originRegex =
  /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?$|^https?:\/\/localhost(?::\d+)?$|^https?:\/\/127\.0\.0\.1(?::\d+)?$/;

function Dashboard() {
  const { userData, loading, fetchUserData } = useContext(UserContext);
  const [confirmKeyName, setConfirmKeyName] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState("USER");
  const [isGuest, setIsGuest] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("api-keys");
  const [keyTypeTab, setKeyTypeTab] = useState("SECRET");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Edit Allowed Origins Modal State
  const [editingKey, setEditingKey] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrigins, setEditOrigins] = useState([]);
  const [editOriginInputText, setEditOriginInputText] = useState("");
  const [editingEditPillIndex, setEditingEditPillIndex] = useState(null);
  const [editingEditPillValue, setEditingEditPillValue] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsOriginRestricted, setEditIsOriginRestricted] = useState(true);

  const toast = useToast();

  const { makeRequest: fetchUserKeys, data: userDataResponse } = useApi({
    method: "get",
    url: "/user/me",
  });

  const { makeRequest: deleteKeyRequest, errorMsg } = useApi({
    method: "delete",
    url: `/user/api-key/${selectedKey?._id}`,
  });

  const { fetchRequest: updateOldKeysRequest } = useApi({
    method: "get",
    url: "/user/update-old-keys",
    withCredentials: true,
  });

  const filteredApiKeys = useMemo(() => {
    return apiKeys.filter((key) => {
      const type = (key.key_type || "").toUpperCase();
      if (keyTypeTab === "PUBLISHABLE") {
        return type === "PUBLISHABLE";
      }
      return type !== "PUBLISHABLE";
    });
  }, [apiKeys, keyTypeTab]);

  const apiKeyTableData = useMemo(() => {
    const result = filteredApiKeys.map((key) => {
      const { key_description, allowed_origins, updated_at, expires_at } = key;
      const expiryDate = new Date(expires_at);
      const today = new Date();
      const daysUntilExpiry = Math.floor(
        (expiryDate - today) / (1000 * 60 * 60 * 24)
      );
      const isExpiringSoon = daysUntilExpiry <= 7;

      const statusDisplay =
        key.is_active !== false ? (
          <span className={styles["badge-status-active"]}>Active</span>
        ) : (
          <span className={styles["badge-status-inactive"]}>Inactive</span>
        );

      const originsDisplay =
        Array.isArray(allowed_origins) && allowed_origins.length > 0 ? (
          allowed_origins.join(", ")
        ) : (
          <span className={styles["badge-off"]}>OFF (Disabled)</span>
        );

      const cells =
        keyTypeTab === "PUBLISHABLE"
          ? [
              key_description,
              statusDisplay,
              originsDisplay,
              formatDate(updated_at),
              formatDate(expires_at),
            ]
          : [key_description, formatDate(updated_at), formatDate(expires_at)];

      return {
        cells,
        rowClassName: isExpiringSoon ? styles["expiry-warning-row"] : "",
      };
    });

    return result;
  }, [filteredApiKeys, keyTypeTab]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData) {
      setIsGuest(userData?.role == "GUEST");
      const userKeys = userData?.keys || [];
      setApiKeys(userKeys);
    }
  }, [userData]);

  useEffect(() => {
    if (userDataResponse?.data?.keys) {
      const userKeys = userDataResponse.data.keys;
      setApiKeys(userKeys);
    }
  }, [userDataResponse]);

  useEffect(() => {
    if (errorMsg) {
      toast.error(errorMsg);
    }
  }, [errorMsg, toast]);

  const handleDeleteClick = (index) => {
    setSelectedKey(filteredApiKeys[index]);
    setConfirmKeyName("");
    setShowModal(true);
  };

  const handleEditClick = (index) => {
    const keyToEdit = filteredApiKeys[index];
    setEditingKey(keyToEdit);
    setEditOrigins(
      keyToEdit.allowed_origins && keyToEdit.allowed_origins.length > 0
        ? [...keyToEdit.allowed_origins]
        : []
    );
    setEditOriginInputText("");
    setEditErrors({});
    setEditIsActive(
      keyToEdit.is_active !== undefined ? keyToEdit.is_active : true
    );
    setEditIsOriginRestricted(
      keyToEdit.is_origin_restricted !== undefined
        ? keyToEdit.is_origin_restricted
        : Boolean(
            keyToEdit.allowed_origins && keyToEdit.allowed_origins.length > 0
          )
    );
    setShowEditModal(true);
  };

  const addEditOriginTag = (rawText) => {
    const trimmed = rawText.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (editOrigins.includes(trimmed)) {
      setEditErrors({
        allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
      });
      toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
      return;
    }
    setEditOrigins((prev) => [...prev, trimmed]);
    setEditOriginInputText("");
    setEditErrors({});
  };

  const handleEditOriginKeyDown = (e) => {
    if (
      e.key === "Enter" ||
      e.key === "," ||
      e.key === " " ||
      e.key === "Tab"
    ) {
      if (e.key === "Tab") {
        if (editOriginInputText.trim()) {
          e.preventDefault();
          addEditOriginTag(editOriginInputText);
        }
      } else {
        e.preventDefault();
        addEditOriginTag(editOriginInputText);
      }
    } else if (
      e.key === "Backspace" &&
      !editOriginInputText &&
      editOrigins.length > 0
    ) {
      setEditOrigins((prev) => prev.slice(0, -1));
    }
  };

  const handleRemoveEditOriginTag = (indexToRemove) => {
    setEditOrigins((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStartEditEditPill = (index, value) => {
    setEditingEditPillIndex(index);
    setEditingEditPillValue(value);
  };

  const handleSaveEditEditPill = (index) => {
    const trimmed = editingEditPillValue.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) {
      setEditOrigins((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      if (editOrigins.some((item, idx) => idx !== index && item === trimmed)) {
        setEditErrors({
          allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
        });
        toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
        return;
      }
      setEditOrigins((prev) =>
        prev.map((item, idx) => (idx === index ? trimmed : item))
      );
      setEditErrors({});
    }
    setEditingEditPillIndex(null);
    setEditingEditPillValue("");
  };

  const handleEditPillKeyDown = (e, index) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSaveEditEditPill(index);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingEditPillIndex(null);
      setEditingEditPillValue("");
    }
  };

  const handleSaveEditKey = async () => {
    let finalOrigins = [];
    if (editIsOriginRestricted) {
      finalOrigins = [...editOrigins];
      if (editOriginInputText.trim()) {
        const extra = editOriginInputText.trim().replace(/^,+|,+$/g, "");
        if (extra) {
          if (finalOrigins.includes(extra)) {
            setEditErrors({
              allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
            });
            toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
            return;
          }
          finalOrigins.push(extra);
        }
      }

      if (finalOrigins.length === 0) {
        setEditErrors({
          allowedOrigins: PUBLISHABLE_KEY.generation.originRequired,
        });
        toast.error(PUBLISHABLE_KEY.generation.originRequired);
        return;
      }

      if (new Set(finalOrigins).size !== finalOrigins.length) {
        setEditErrors({
          allowedOrigins: PUBLISHABLE_KEY.generation.duplicateOrigin,
        });
        toast.error(PUBLISHABLE_KEY.generation.duplicateOrigin);
        return;
      }

      if (!finalOrigins.every((o) => originRegex.test(o))) {
        setEditErrors({
          allowedOrigins: PUBLISHABLE_KEY.generation.invalidOrigin,
        });
        toast.error(PUBLISHABLE_KEY.generation.invalidOrigin);
        return;
      }
    }

    try {
      await instance.patch(`/user/api-key/${editingKey._id}`, {
        allowed_origins: editIsOriginRestricted ? finalOrigins : [],
        is_origin_restricted: editIsOriginRestricted,
        is_active: editIsActive,
      });

      setApiKeys((prevKeys) =>
        prevKeys.map((key) =>
          key._id === editingKey._id
            ? {
                ...key,
                allowed_origins: editIsOriginRestricted ? finalOrigins : [],
                is_origin_restricted: editIsOriginRestricted,
                is_active: editIsActive,
              }
            : key
        )
      );

      toast.success(PUBLISHABLE_KEY.edit.success);
      setShowEditModal(false);
      setEditingKey(null);
      await fetchUserKeys();
      fetchUserData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update key");
    }
  };

  useEffect(() => {
    async function checkOldKeys() {
      const result = await updateOldKeysRequest();

      if (!result.success && result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success && result.data?.keysUpdated === true) {
        setShowLoader(true);
        setTimeout(() => {
          setShowLoader(false);
          setShowUpdateModal(true);
        }, 2000);
      }
    }

    checkOldKeys();
  }, [toast, updateOldKeysRequest]);

  const handleKeyNameChange = (e) => {
    setConfirmKeyName(e.target.value);
  };

  const handleDeleteKey = async () => {
    if (!selectedKey?._id) {
      toast.error(API_KEY.delete.invalidKey);
      return;
    }
    setIsDeleting(true);
    const success = await deleteKeyRequest();
    if (success) {
      toast.success(
        selectedKey?.key_type?.toUpperCase() === "PUBLISHABLE"
          ? PUBLISHABLE_KEY.delete.success
          : API_KEY.delete.success
      );
      setShowModal(false);
      await fetchUserKeys();
    }
    setIsDeleting(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setConfirmKeyName("");
  };

  if (loading) {
    return (
      <div
        className={styles["dashboard-container"]}
        data-testid="testid-dashboard"
      >
        <div
          data-testid="loading-spinner"
          className={styles["spinner-container"]}
        >
          <LoadingSpinner size={40} border={4} color="var(--primary)" />
        </div>
      </div>
    );
  }

  const handleKeyGenerated = async () => {
    const success = await fetchUserKeys();
    if (!success) {
      toast.error("Failed to fetch updated API keys");
    }
  };

  const dashboardDropdownOptions = [];
  if (userData?.role === "ADMIN") {
    dashboardDropdownOptions.push("ADMIN", "OPERATOR", "USER");
  } else if (userData?.role === "OPERATOR") {
    dashboardDropdownOptions.push("OPERATOR", "USER");
  }

  const handleRoleSelect = (role) => {
    setSelectedDashboard(role);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={styles["dashboard-container"]}
      data-testid="testid-dashboard"
    >
      {showLoader && (
        <div className={styles["overlay-loader"]}>
          <div className={styles["loader-content"]}>
            <LoadingSpinner size={60} border={6} />
            <p className={styles["loader-text"]}>Please wait...</p>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <InformationModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          heading="Notification"
          buttonText="I Understand"
          closeOnOverlayClick={false}
          message={
            <p>
              Our application has undergone some improvements. Now your old API
              keys feature a <b>1 year</b> expiry.
            </p>
          }
        />
      )}

      {selectedDashboard === "ADMIN" ? (
        <div data-testid="testid-admin-dashboard">
          <AdminDashboard
            selectedDashboard={selectedDashboard}
            dashboardDropdownOptions={dashboardDropdownOptions}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleRoleSelect={handleRoleSelect}
          />
        </div>
      ) : selectedDashboard === "OPERATOR" ? (
        <div data-testid="testid-operator-dashboard">
          <OperatorDashboard
            selectedDashboard={selectedDashboard}
            dashboardDropdownOptions={dashboardDropdownOptions}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            handleRoleSelect={handleRoleSelect}
            headerStyles={styles}
          />
        </div>
      ) : (
        <>
          <div className={styles["page-header"]}>
            <div className={styles["title-section"]}>
              <h1 className={styles["dashboard-title"]}>Dashboard</h1>
              <p className={styles["dashboard-subtitle"]}>
                Manage your account, view analytics, and control your API
                access.
              </p>
            </div>

            <div className={styles["header-right"]}>
              {(userData?.role === "ADMIN" ||
                userData?.role === "OPERATOR") && (
                <div className={styles["dropdown-wrapper"]}>
                  <button
                    className={styles["dropdown"]}
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
                    <div className={styles["dropdown-menu"]}>
                      {dashboardDropdownOptions.map((option) => (
                        <div
                          key={option}
                          className={styles["dropdown-item"]}
                          onClick={() => handleRoleSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles["tabs"]}>
                <button
                  className={`${styles["tab"]} ${
                    activeTab === "analytics" ? styles["active-tab"] : ""
                  }`}
                  onClick={() => setActiveTab("analytics")}
                >
                  Analytics
                </button>
                <button
                  className={`${styles["tab"]} ${
                    activeTab === "api-keys" ? styles["active-tab"] : ""
                  }`}
                  onClick={() => setActiveTab("api-keys")}
                >
                  Access Keys
                </button>
                <button
                  className={`${styles["tab"]} ${
                    activeTab === "rewards" ? styles["active-tab"] : ""
                  }`}
                  onClick={() => setActiveTab("rewards")}
                >
                  Rewards
                </button>
              </div>
            </div>
          </div>

          <div className={styles["content"]}>
            {activeTab === "analytics" && (
              <div className={styles["analytics-content"]}>
                <div className={styles["analytics-grid"]}>
                  <div className={styles["analytics-card"]}>
                    <Graph isGuest={isGuest} />
                  </div>
                  <div className={styles["analytics-card"]}>
                    <Usage
                      isGuest={isGuest}
                      usageCount={userData?.subscription.usage_count || 0}
                      usageLimit={userData?.subscription.usage_limit || 0}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api-keys" && (
              <div className={styles["api-keys-container"]}>
                <div className={styles["key-type-selector"]}>
                  <button
                    className={`${styles["key-type-btn"]} ${
                      keyTypeTab === "SECRET" ? styles["active-key-type"] : ""
                    }`}
                    onClick={() => setKeyTypeTab("SECRET")}
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
                    >
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                    API Keys
                  </button>
                  <button
                    className={`${styles["key-type-btn"]} ${
                      keyTypeTab === "PUBLISHABLE"
                        ? styles["active-key-type"]
                        : ""
                    }`}
                    onClick={() => setKeyTypeTab("PUBLISHABLE")}
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
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>
                    </svg>
                    Publishable Keys
                  </button>
                </div>

                <div className={styles["api-keys-grid"]}>
                  <div className={styles["left-column"]}>
                    <div className={styles["card"]}>
                      <ApiKeyForm
                        isGuest={isGuest}
                        onKeyGenerated={handleKeyGenerated}
                        keyType={keyTypeTab}
                      />
                    </div>
                  </div>

                  <div className={styles["card"]}>
                    <div className={styles["keys-header"]}>
                      <h2 className={styles["card-title"]}>
                        {keyTypeTab === "PUBLISHABLE"
                          ? "Active Publishable Keys"
                          : "Active API Keys"}
                      </h2>
                      <span className={styles["badge"]}>
                        {filteredApiKeys.length}{" "}
                        {filteredApiKeys.length === 1 ? "key" : "keys"} found
                      </span>
                    </div>
                    <p className={styles["subtext"]}>
                      {keyTypeTab === "PUBLISHABLE"
                        ? "Manage and monitor your existing publishable credentials"
                        : "Manage and monitor your existing access credentials"}
                    </p>
                    <div className={styles["table-wrapper"]}>
                      <Table
                        headers={
                          keyTypeTab === "PUBLISHABLE"
                            ? PUBLISHABLE_KEY_TABLE.headers
                            : API_KEY_TABLE.headers
                        }
                        rows={apiKeyTableData}
                        onDelete={handleDeleteClick}
                        onEdit={
                          keyTypeTab === "PUBLISHABLE"
                            ? handleEditClick
                            : undefined
                        }
                        isGuest={isGuest}
                        emptyMessage={
                          keyTypeTab === "PUBLISHABLE"
                            ? PUBLISHABLE_KEY_TABLE.emptyMessage
                            : API_KEY_TABLE.emptyMessage
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rewards" && (
              <div className={styles["rewards-content"]}>
                <UserRewardsDashboard />
              </div>
            )}
          </div>
        </>
      )}

      {showEditModal && editingKey && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          customWidth="540px"
        >
          <div className={styles["edit-modal-content"]}>
            <div className={styles["edit-modal-header"]}>
              <div className={styles["edit-modal-icon"]}>
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div>
                <h2 className={styles["edit-modal-title"]}>
                  {PUBLISHABLE_KEY.edit.modal.title}
                </h2>
                <p className={styles["edit-modal-subtitle"]}>
                  {PUBLISHABLE_KEY.edit.modal.subtitle}
                </p>
              </div>
            </div>

            <div className={styles["form-group"]}>
              <div className={styles["toggle-header"]}>
                <label className={styles["label"]}>Key Status</label>
                <button
                  type="button"
                  role="switch"
                  aria-label="Key Status"
                  aria-checked={editIsActive}
                  className={`${styles["toggle-switch"]} ${
                    editIsActive ? styles["toggle-active"] : ""
                  }`}
                  onClick={() => setEditIsActive((prev) => !prev)}
                >
                  <span className={styles["toggle-thumb"]} />
                </button>
              </div>
              <p className={styles["toggle-subtitle"]}>
                {editIsActive
                  ? "Key is active and accepting requests"
                  : "Key is deactivated and rejecting requests"}
              </p>
            </div>

            <div className={styles["form-group"]}>
              <div className={styles["toggle-header"]}>
                <label className={styles["label"]}>Origin Restriction</label>
                <button
                  type="button"
                  role="switch"
                  aria-label="Origin Restriction"
                  aria-checked={editIsOriginRestricted}
                  className={`${styles["toggle-switch"]} ${
                    editIsOriginRestricted ? styles["toggle-active"] : ""
                  }`}
                  onClick={() => setEditIsOriginRestricted((prev) => !prev)}
                >
                  <span className={styles["toggle-thumb"]} />
                </button>
              </div>
              <p className={styles["toggle-subtitle"]}>
                {editIsOriginRestricted
                  ? "Restrict key usage to specified origin domains"
                  : "Allow key usage from any origin domain"}
              </p>
            </div>

            {editIsOriginRestricted && (
              <div className={styles["form-group"]}>
                <div className={styles["origins-list-header"]}>
                  <label className={styles["label"]}>Allowed Origins</label>
                  <span className={styles["origins-count"]}>
                    {editOrigins.length +
                      (editOriginInputText.trim() &&
                      !editOrigins.includes(editOriginInputText.trim())
                        ? 1
                        : 0)}{" "}
                    {editOrigins.length === 1 ? "origin" : "origins"}
                  </span>
                </div>
                <div className={styles["tag-input-box"]}>
                  {editOrigins.map((origin, index) => (
                    <span key={index} className={styles["origin-pill"]}>
                      {editingEditPillIndex === index ? (
                        <input
                          type="text"
                          className={styles["pill-edit-input"]}
                          value={editingEditPillValue}
                          onChange={(e) =>
                            setEditingEditPillValue(e.target.value)
                          }
                          onKeyDown={(e) => handleEditPillKeyDown(e, index)}
                          onBlur={() => handleSaveEditEditPill(index)}
                          autoFocus
                        />
                      ) : (
                        <>
                          <span
                            className={styles["pill-text"]}
                            onClick={() =>
                              handleStartEditEditPill(index, origin)
                            }
                            title="Click to edit origin"
                          >
                            {origin}
                          </span>
                          <button
                            type="button"
                            className={styles["pill-remove-btn"]}
                            onClick={() => handleRemoveEditOriginTag(index)}
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
                    name="edit-origin-tag-input"
                    className={styles["tag-input-field"]}
                    placeholder={
                      editOrigins.length === 0
                        ? "e.g., https://example.com or http://localhost:8080"
                        : "Add origin..."
                    }
                    value={editOriginInputText}
                    onChange={(e) => setEditOriginInputText(e.target.value)}
                    onKeyDown={handleEditOriginKeyDown}
                    onBlur={() => {
                      if (editOriginInputText.trim()) {
                        addEditOriginTag(editOriginInputText);
                      }
                    }}
                  />
                </div>

                {editErrors.allowedOrigins && (
                  <p className={styles["error-message"]}>
                    {editErrors.allowedOrigins}
                  </p>
                )}
              </div>
            )}

            <div className={styles["modal-actions"]}>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditKey}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <div data-testid="delete-api-key-modal">
          <ConfirmationModal
            isOpen={showModal}
            onClose={handleModalClose}
            onConfirm={handleDeleteKey}
            isConfirmDisabled={confirmKeyName !== selectedKey?.key_description}
            isConfirmLoading={isDeleting}
            confirmButtonContent={BUTTON_TEXT.delete}
            customHeading={
              selectedKey?.key_type?.toUpperCase() === "PUBLISHABLE"
                ? PUBLISHABLE_KEY.delete.modal.title
                : API_KEY.delete.modal.title
            }
            customDescription={
              <div>
                {selectedKey?.key_type?.toUpperCase() === "PUBLISHABLE"
                  ? PUBLISHABLE_KEY.delete.modal.description
                  : API_KEY.delete.modal.description}{" "}
                <strong className={styles["deletekey-name"]}>
                  {selectedKey.key_description}
                </strong>
                ?{" "}
                {selectedKey?.key_type?.toUpperCase() === "PUBLISHABLE"
                  ? PUBLISHABLE_KEY.delete.modal.warning
                  : API_KEY.delete.modal.warning}
              </div>
            }
          >
            <CustomInput
              data-testid="api-key-confirm-input"
              type="text"
              name="apiKeyName"
              label="API Key Name"
              value={confirmKeyName}
              onChange={handleKeyNameChange}
            />
          </ConfirmationModal>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
