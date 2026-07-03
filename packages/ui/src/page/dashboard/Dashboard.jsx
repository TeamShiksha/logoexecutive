import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../contexts/Contexts.jsx";
import ApiKeyForm from "../../components/apikeyform/ApiKeyForm";
import Usage from "../../components/usage/Usage";
import styles from "./Dashboard.module.css";
import Table from "../../components/common/table/Table.jsx";
import { formatDate } from "../../utils/Helpers";
import { API_KEY, API_KEY_TABLE, BUTTON_TEXT } from "../../utils/Constants.js";
import ConfirmationModal from "../../components/confirm/ConfirmationModal.jsx";
import { useApi } from "../../hooks/useApi.js";
import { useToast } from "../../hooks/useToast.js";
import LoadingSpinner from "../../components/common/loadingspinner/LoadingSpinner.jsx";
import AdminDashboard from "../../components/admin/AdminDashboard.jsx";
import CustomInput from "../../components/common/input/CustomInput.jsx";
import OperatorDashboard from "../../components/operator/OperatorDashboard.jsx";
import InformationModal from "../../components/information/InformationModal.jsx";
import Graph from "../../components/graph/Graph.jsx";
import UserRewardsDashboard from "../../components/rewards/UserRewardsDashboard.jsx";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const apiKeyTableData = useMemo(() => {
    const result = apiKeys.map(
      ({ key_description, updated_at, expires_at }) => {
        const expiryDate = new Date(expires_at);
        const today = new Date();
        const daysUntilExpiry = Math.floor(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );
        const isExpiringSoon = daysUntilExpiry <= 7;

        return {
          cells: [
            key_description,
            formatDate(updated_at),
            formatDate(expires_at),
          ],
          rowClassName: isExpiringSoon ? styles["expiry-warning-row"] : "",
        };
      }
    );

    return result;
  }, [apiKeys]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData) {
      setIsGuest(userData?.role == "GUEST");
      setApiKeys(userData?.keys || []);
    }
  }, [userData]);

  useEffect(() => {
    if (userDataResponse?.data?.keys) {
      setApiKeys(userDataResponse.data.keys);
    }
  }, [userDataResponse]);

  useEffect(() => {
    if (errorMsg) {
      toast.error(errorMsg);
    }
  }, [errorMsg, toast]);

  const handleDeleteClick = (index) => {
    setSelectedKey(apiKeys[index]);
    setConfirmKeyName("");
    setShowModal(true);
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
      toast.success(API_KEY.delete.success);
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
                  API Keys
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
              <div className={styles["api-keys-grid"]}>
                <div className={styles["left-column"]}>
                  <div className={styles["card"]}>
                    <ApiKeyForm
                      isGuest={isGuest}
                      onKeyGenerated={handleKeyGenerated}
                    />
                  </div>
                </div>

                <div className={styles["card"]}>
                  <div className={styles["keys-header"]}>
                    <h2 className={styles["card-title"]}>Active API Keys</h2>
                    <span className={styles["badge"]}>
                      {apiKeys.length} {apiKeys.length === 1 ? "key" : "keys"}{" "}
                      found
                    </span>
                  </div>
                  <p className={styles["subtext"]}>
                    Manage and monitor your existing access credentials
                  </p>
                  <div className={styles["table-wrapper"]}>
                    <Table
                      headers={API_KEY_TABLE.headers}
                      rows={apiKeyTableData}
                      onDelete={handleDeleteClick}
                      isGuest={isGuest}
                      emptyMessage={API_KEY_TABLE.emptyMessage}
                    />
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

      {showModal && (
        <div data-testid="delete-api-key-modal">
          <ConfirmationModal
            isOpen={showModal}
            onClose={handleModalClose}
            onConfirm={handleDeleteKey}
            isConfirmDisabled={confirmKeyName !== selectedKey?.key_description}
            isConfirmLoading={isDeleting}
            confirmButtonContent={BUTTON_TEXT.delete}
            customHeading={API_KEY.delete.modal.title}
            customDescription={
              <div>
                {API_KEY.delete.modal.description}{" "}
                <strong className={styles["deletekey-name"]}>
                  {selectedKey.key_description}
                </strong>
                ? {API_KEY.delete.modal.warning}
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
