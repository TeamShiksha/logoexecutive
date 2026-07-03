import { useState } from "react";
import Analytics from "../../components/analytics/Analytics";
import Catalog from "../catalog/Catalog.jsx";
import SubscriptionPanel from "./SubscriptionPanel.jsx";

import RewardPanel from "./RewardPanel.jsx";
import PropTypes from "prop-types";
import styles from "./AdminDashboard.module.css";

const TABS = {
  OVERVIEW: "overview",
  SUBSCRIPTIONS: "subscriptions",
  REWARDS: "rewards",
};

function AdminDashboard({
  selectedDashboard,
  dashboardDropdownOptions,
  isDropdownOpen,
  setIsDropdownOpen,
  handleRoleSelect,
}) {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  return (
    <div className={styles["admin-dashboard"]} data-testid="admin-dashboard">
      <div className={styles["page-header"]}>
        <div className={styles["title-section"]}>
          <h1 className={styles["dashboard-title"]}>Admin Dashboard</h1>
          <p className={styles["dashboard-subtitle"]}>
            Manage users, monitor system activity, and configure settings.
          </p>
        </div>

        <div className={styles["header-right"]}>
          {dashboardDropdownOptions && dashboardDropdownOptions.length > 0 && (
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
                activeTab === TABS.OVERVIEW ? styles["active-tab"] : ""
              }`}
              onClick={() => setActiveTab(TABS.OVERVIEW)}
            >
              Overview
            </button>
            <button
              className={`${styles["tab"]} ${
                activeTab === TABS.SUBSCRIPTIONS ? styles["active-tab"] : ""
              }`}
              onClick={() => setActiveTab(TABS.SUBSCRIPTIONS)}
            >
              Subscriptions
            </button>
            <button
              className={`${styles["tab"]} ${
                activeTab === TABS.REWARDS ? styles["active-tab"] : ""
              }`}
              onClick={() => setActiveTab(TABS.REWARDS)}
            >
              Rewards
            </button>
          </div>
        </div>
      </div>

      {activeTab === TABS.OVERVIEW && (
        <>
          <Analytics />
          <Catalog />
        </>
      )}
      {activeTab === TABS.SUBSCRIPTIONS && <SubscriptionPanel />}
      {activeTab === TABS.REWARDS && <RewardPanel />}
    </div>
  );
}

AdminDashboard.propTypes = {
  selectedDashboard: PropTypes.string.isRequired,
  dashboardDropdownOptions: PropTypes.array.isRequired,
  isDropdownOpen: PropTypes.bool.isRequired,
  setIsDropdownOpen: PropTypes.func.isRequired,
  handleRoleSelect: PropTypes.func.isRequired,
};

export default AdminDashboard;
