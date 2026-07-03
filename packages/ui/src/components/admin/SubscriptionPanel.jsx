import { useState } from "react";
import UserSubscriptions from "./UserSubscriptions.jsx";
import SubscriptionLogs from "./SubscriptionLogs.jsx";
import styles from "./SubscriptionPanel.module.css";
import { SUBSCRIPTION_PANEL } from "../../utils/Constants.js";

const TABS = {
  SUBSCRIPTIONS: "subscriptions",
  LOGS: "logs",
};

function SubscriptionPanel() {
  const [activeTab, setActiveTab] = useState(TABS.SUBSCRIPTIONS);

  return (
    <div className={styles.panel} data-testid="subscription-panel">
      {/* Tab bar */}
      <div className={styles["tabs-container"]}>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === TABS.SUBSCRIPTIONS ? styles["active-tab"] : ""
          }`}
          onClick={() => setActiveTab(TABS.SUBSCRIPTIONS)}
        >
          {SUBSCRIPTION_PANEL.tabs.subscriptions}
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === TABS.LOGS ? styles["active-tab"] : ""
          }`}
          onClick={() => setActiveTab(TABS.LOGS)}
        >
          {SUBSCRIPTION_PANEL.tabs.logs}
        </button>
      </div>

      {/* Tab content — conditional render so API only fires for the active tab */}
      <div className={styles["tab-content"]}>
        {activeTab === TABS.SUBSCRIPTIONS && <UserSubscriptions embedded />}
        {activeTab === TABS.LOGS && <SubscriptionLogs />}
      </div>
    </div>
  );
}

export default SubscriptionPanel;
