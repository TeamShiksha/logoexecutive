import PropTypes from "prop-types";
import styles from "./Usage.module.css";
import { USAGE } from "../../utils/Constants";
import { useContext, useEffect, useMemo } from "react";
import { useToast } from "../../hooks/useToast.js";
import { UserContext } from "../../contexts/Contexts.jsx";

const THRESHOLDS = [
  { p: 100, type: "error" },
  { p: 95, type: "error" },
  { p: 90, type: "warning" },
  { p: 80, type: "warning" },
];

const DUMMY_USAGE_COUNT = 42;
const DUMMY_USAGE_LIMIT = 500;

function Usage({ usageCount, usageLimit, isGuest = false }) {
  const effectiveCount = isGuest ? DUMMY_USAGE_COUNT : usageCount;
  const effectiveLimit = isGuest ? DUMMY_USAGE_LIMIT : usageLimit;
  const { userData } = useContext(UserContext);
  const percentage = useMemo(
    () => Math.min((effectiveCount / effectiveLimit) * 100, 100),
    [effectiveCount, effectiveLimit]
  );
  const toast = useToast();

  const billingCycleStartDate = useMemo(() => {
    if (!userData?.subscription?.updated_at) return null;
    return userData.subscription.updated_at;
  }, [userData?.subscription?.updated_at]);

  useEffect(() => {
    if (
      isGuest ||
      !Number.isFinite(percentage) ||
      usageLimit <= 0 ||
      !toast ||
      !billingCycleStartDate
    )
      return;

    const crossedThreshold = THRESHOLDS.find(({ p }) => percentage >= p);

    if (crossedThreshold) {
      const { p, type } = crossedThreshold;

      const cycleStartDate = new Date(billingCycleStartDate);
      const cycleId = cycleStartDate.toISOString().split("T")[0];
      const storageKey = `usage_limit_notification_${p}_cycle_${cycleId}`;

      const hasShownThisCycle = localStorage.getItem(storageKey);

      if (!hasShownThisCycle) {
        const msg = `You have used ${Math.floor(percentage)}% of your monthly API limit (${usageCount}/${usageLimit}).`;
        toast[type](msg);
        localStorage.setItem(storageKey, "true");
      }
    }
  }, [
    percentage,
    usageCount,
    usageLimit,
    toast,
    billingCycleStartDate,
    isGuest,
  ]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles["usage-container"]}>
      <div className={styles["card-header"]}>
        <h2 className={styles["card-title"]}>Usage</h2>
      </div>
      <div className={styles["usage-content"]}>
        <div className={styles["donut-wrapper"]}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 160 160"
            preserveAspectRatio="xMidYMid meet"
          >
            {" "}
            <circle
              className={styles["donut-circle"]}
              stroke="var(--border-color)"
              strokeWidth="20"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
            />
            <circle
              className={styles["donut-circle"]}
              stroke="#818cf8"
              strokeWidth="20"
              fill="transparent"
              r={radius}
              cx="80"
              cy="80"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className={styles["donut-text"]}>{Math.round(percentage)}%</div>
        </div>

        <div className={styles["usage-legend"]}>
          <div className={styles["usage-item"]}>
            <span className={styles["usage-label"]}>{USAGE.callsText}</span>
            <span className={styles["usage-value"]}>{effectiveCount}</span>
          </div>
          <div className={styles["usage-item"]}>
            <span className={styles["usage-label"]}>{USAGE.limitText}</span>
            <span className={styles["usage-value"]}>{effectiveLimit}</span>
          </div>
        </div>

        <p className={styles["usage-reset"]}>{USAGE.resetText}</p>
      </div>
    </div>
  );
}

Usage.propTypes = {
  usageCount: PropTypes.number,
  usageLimit: PropTypes.number,
  isGuest: PropTypes.bool,
};

export default Usage;
