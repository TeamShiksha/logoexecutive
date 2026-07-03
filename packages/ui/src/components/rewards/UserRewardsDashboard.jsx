import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import Button from "../common/button/Button.jsx";
import Modal from "../common/modal/Modal.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import LeaderboardView from "./LeaderboardView.jsx";
import { USER_REWARDS_DASHBOARD } from "../../utils/Constants.js";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  TrendingUp,
  Upload,
} from "lucide-react";
import styles from "./UserRewardsDashboard.module.css";

const TRANSACTIONS_PER_PAGE = 10;

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTransactionType(type) {
  const typeMap = {
    MILESTONE_REWARD: "Milestone",
    MANUAL_ADJUSTMENT: "Adjustment",
    REVERSAL: "Reversal",
    BONUS: "Bonus",
  };
  return typeMap[type] || type;
}

function formatTransactionReason(reason) {
  const reasonMap = {
    NORMAL_MILESTONE: "Normal Milestone",
    DUPLICATE_REMOVAL: "Duplicate Removal",
    SUSPICIOUS_ACTIVITY: "Suspicious Activity",
    MANUAL_CORRECTION: "Manual Correction",
    PROMOTION: "Promotion",
    SYSTEM_ERROR: "System Error",
  };
  return reasonMap[reason] || reason || "—";
}

function UserRewardsDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [txPage, setTxPage] = useState(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const {
    fetchRequest: fetchSummary,
    data: summaryData,
    loading: summaryLoading,
  } = useApi({
    method: "GET",
    url: "/rewards/summary/user",
  });

  const {
    fetchRequest: fetchTransactions,
    data: transactionsData,
    loading: txLoading,
  } = useApi({
    method: "GET",
    url: `/rewards/transactions/user?page=${txPage}&limit=${TRANSACTIONS_PER_PAGE}`,
  });

  useEffect(() => {
    fetchSummary().then(({ success, error }) => {
      if (!success && error) {
        toast.error(USER_REWARDS_DASHBOARD.toasts.summaryError);
      }
    });
    fetchTransactions().then(({ success, error }) => {
      if (!success && error) {
        toast.error(USER_REWARDS_DASHBOARD.toasts.historyError);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (txPage > 1) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage]);

  const summary = summaryData?.data;
  const transactions = transactionsData?.data?.data || [];
  const txTotalPages = transactionsData?.data?.totalPages || 1;

  const isLoading = summaryLoading;

  if (showLeaderboard) {
    return <LeaderboardView onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className={styles["rewards-container"]}>
      <div className={styles["rewards-header"]}>
        <div className={styles["header-content"]}>
          <div>
            <h2 className={styles["rewards-title"]}>
              {USER_REWARDS_DASHBOARD.title}
            </h2>
            <p className={styles["rewards-subtitle"]}>
              {USER_REWARDS_DASHBOARD.subtitle}
            </p>
          </div>
          <div className={styles["header-actions"]}>
            <Button
              variant="secondary"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy size={16} />
              {USER_REWARDS_DASHBOARD.viewLeaderboard}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles["loading-container"]}>
          <LoadingSpinner size={40} border={4} color="var(--primary)" />
        </div>
      ) : (
        <>
          <div className={styles["stats-grid"]}>
            <button
              type="button"
              className={`${styles["stat-card"]} ${styles["stat-card-clickable"]}`}
              onClick={() => setShowTxModal(true)}
            >
              <div className={styles["stat-icon-wrapper"]}>
                <Star size={24} className={styles["stat-icon"]} />
              </div>
              <div className={styles["stat-content"]}>
                <span className={styles["stat-value"]}>
                  {summary?.currentPoints || 0}
                </span>
                <span className={styles["stat-label"]}>
                  {USER_REWARDS_DASHBOARD.stats.currentPoints}
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`${styles["stat-card"]} ${styles["stat-card-clickable"]}`}
              onClick={() => setShowTxModal(true)}
            >
              <div className={styles["stat-icon-wrapper"]}>
                <Trophy size={24} className={styles["stat-icon"]} />
              </div>
              <div className={styles["stat-content"]}>
                <span className={styles["stat-value"]}>
                  {summary?.lifetimePoints || 0}
                </span>
                <span className={styles["stat-label"]}>
                  {USER_REWARDS_DASHBOARD.stats.lifetimePoints}
                </span>
              </div>
            </button>

            <div className={styles["stat-card"]}>
              <div className={styles["stat-icon-wrapper"]}>
                <TrendingUp size={24} className={styles["stat-icon"]} />
              </div>
              <div className={styles["stat-content"]}>
                <span className={styles["stat-value"]}>
                  {summary?.averagePointsPerImage?.toFixed(1) || "0.0"}
                </span>
                <span className={styles["stat-label"]}>
                  {USER_REWARDS_DASHBOARD.stats.avgPoints}
                </span>
              </div>
            </div>
          </div>

          <div className={styles["images-section"]}>
            <div className={styles["section-header"]}>
              <div className={styles["section-header-content"]}>
                <div>
                  <h3 className={styles["section-title"]}>
                    {USER_REWARDS_DASHBOARD.images.title}
                  </h3>
                  <p className={styles["section-subtitle"]}>
                    {USER_REWARDS_DASHBOARD.images.subtitle}
                  </p>
                </div>
                <div className={styles["images-header-actions"]}>
                  <span className={styles["images-contributed-label"]}>
                    {summary?.totalImages || 0}{" "}
                    {USER_REWARDS_DASHBOARD.stats.totalImages}
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/createlogo")}
                  >
                    <Upload size={16} />
                    {USER_REWARDS_DASHBOARD.uploadImage}
                  </Button>
                </div>
              </div>
            </div>
            {summary?.rewards?.length > 0 ? (
              <div className={styles["images-grid"]}>
                {summary.rewards.map((reward) => (
                  <div key={reward.imageId} className={styles["image-card"]}>
                    <div className={styles["image-preview"]}>
                      {reward.imageUrl ? (
                        <img
                          src={reward.imageUrl}
                          alt={reward.imageName}
                          className={styles["image-thumbnail"]}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={styles["image-fallback"]}
                        style={{ display: reward.imageUrl ? "none" : "flex" }}
                      >
                        {reward.imageName?.charAt(0).toUpperCase() || "?"}
                      </div>
                    </div>
                    <div className={styles["image-info"]}>
                      <h4 className={styles["image-name"]}>
                        {reward.imageName}
                      </h4>
                      <div className={styles["image-stats"]}>
                        <div className={styles["image-stat"]}>
                          <span className={styles["image-stat-value"]}>
                            {reward.totalPointsAwarded}
                          </span>
                          <span className={styles["image-stat-label"]}>
                            {USER_REWARDS_DASHBOARD.images.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles["empty-state"]}>
                {USER_REWARDS_DASHBOARD.images.emptyState}
              </p>
            )}
          </div>

          <Modal
            isOpen={showTxModal}
            onClose={() => setShowTxModal(false)}
            customWidth="700px"
          >
            <div className={styles["tx-modal-content"]}>
              <h3 className={styles["tx-modal-title"]}>
                {USER_REWARDS_DASHBOARD.history.title}
              </h3>
              {(() => {
                if (txLoading) {
                  return (
                    <div className={styles["loading-container"]}>
                      <LoadingSpinner
                        size={32}
                        border={3}
                        color="var(--primary)"
                      />
                    </div>
                  );
                }
                if (transactions.length > 0) {
                  return (
                    <>
                      <div className={styles["table-wrapper"]}>
                        <table className={styles["table"]}>
                          <thead>
                            <tr>
                              {USER_REWARDS_DASHBOARD.history.headers.map(
                                (h) => (
                                  <th key={h}>{h}</th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx._id}>
                                <td>
                                  <span className={styles["type-badge"]}>
                                    {formatTransactionType(tx.transaction_type)}
                                  </span>
                                </td>
                                <td className={styles["points-cell"]}>
                                  {tx.points_awarded > 0 ? "+" : ""}
                                  {tx.points_awarded}
                                </td>
                                <td>{tx.image_id?.company_name || "—"}</td>
                                <td>{formatTransactionReason(tx.reason)}</td>
                                <td>{formatDate(tx.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {txTotalPages > 1 && (
                        <div className={styles["pagination"]}>
                          <button
                            type="button"
                            className={styles["page-btn"]}
                            disabled={txPage === 1 || txLoading}
                            onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                            aria-label="Previous page"
                          >
                            <ChevronLeft size={16} aria-hidden="true" />
                          </button>
                          <span className={styles["page-indicator"]}>
                            Page {txPage} of {txTotalPages}
                          </span>
                          <button
                            type="button"
                            className={styles["page-btn"]}
                            disabled={txPage === txTotalPages || txLoading}
                            onClick={() =>
                              setTxPage((p) => Math.min(txTotalPages, p + 1))
                            }
                            aria-label="Next page"
                          >
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </>
                  );
                }
                return (
                  <p className={styles["empty-state"]}>
                    {USER_REWARDS_DASHBOARD.history.emptyState}
                  </p>
                );
              })()}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

export default UserRewardsDashboard;
