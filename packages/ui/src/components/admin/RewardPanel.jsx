import { useState } from "react";
import MilestoneConfig from "./MilestoneConfig.jsx";
import UserRewards from "./UserRewards.jsx";
import styles from "./RewardPanel.module.css";
import { REWARD_PANEL } from "../../utils/Constants.js";

const TABS = {
  MILESTONES: "milestones",
  USER_REWARDS: "userRewards",
};

function RewardPanel() {
  const [activeTab, setActiveTab] = useState(TABS.MILESTONES);

  return (
    <div className={styles.panel} data-testid="reward-panel">
      <div className={styles["tabs-container"]}>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === TABS.MILESTONES ? styles["active-tab"] : ""
          }`}
          onClick={() => setActiveTab(TABS.MILESTONES)}
        >
          {REWARD_PANEL.tabs.milestones}
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === TABS.USER_REWARDS ? styles["active-tab"] : ""
          }`}
          onClick={() => setActiveTab(TABS.USER_REWARDS)}
        >
          {REWARD_PANEL.tabs.userRewards}
        </button>
      </div>

      <div className={styles["tab-content"]}>
        {activeTab === TABS.MILESTONES && <MilestoneConfig embedded />}
        {activeTab === TABS.USER_REWARDS && <UserRewards />}
      </div>
    </div>
  );
}

export default RewardPanel;
