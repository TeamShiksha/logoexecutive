import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "../common/modal/Modal.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import { IMAGE_REWARD_MODAL } from "../../utils/Constants.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ImageRewardModal.module.css";

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
  if (!reason) return "—";
  const reasonMap = {
    NORMAL_MILESTONE: "Normal Milestone",
    DUPLICATE_REMOVAL: "Duplicate Removal",
    SUSPICIOUS_ACTIVITY: "Suspicious Activity",
    MANUAL_CORRECTION: "Manual Correction",
    PROMOTION: "Promotion",
    SYSTEM_ERROR: "System Error",
  };
  return reasonMap[reason] || reason;
}

function ImageRewardModal({ isOpen, onClose, imageId, imageName, userId }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [bonusDescription, setBonusDescription] = useState("");

  const {
    fetchRequest: fetchSummary,
    data: summaryData,
    loading: summaryLoading,
  } = useApi({
    method: "GET",
    url: `/rewards/summary/image/${imageId}`,
  });

  const {
    fetchRequest: fetchTransactions,
    data: transactionsData,
    loading: transactionsLoading,
  } = useApi({
    method: "GET",
    url: `/rewards/transactions/image/${imageId}?page=${page}&limit=${TRANSACTIONS_PER_PAGE}`,
  });

  const { fetchRequest: awardBonus, loading: bonusSubmitting } = useApi({
    method: "POST",
    url: "/admin/rewards/bonus",
  });

  useEffect(() => {
    if (isOpen && imageId) {
      setPage(1);
      setShowBonusForm(false);
      fetchSummary().then(({ success, error }) => {
        if (!success && error) {
          toast.error(IMAGE_REWARD_MODAL.toasts.summaryError);
        }
      });
      fetchTransactions().then(({ success, error }) => {
        if (!success && error) {
          toast.error(IMAGE_REWARD_MODAL.toasts.transactionsError);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageId]);

  useEffect(() => {
    if (isOpen && imageId && page > 1) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAwardBonus = async () => {
    if (!bonusPoints || Number.parseInt(bonusPoints) <= 0) {
      toast.error(IMAGE_REWARD_MODAL.bonus.validation.pointsRequired);
      return;
    }
    if (!bonusReason.trim()) {
      toast.error(IMAGE_REWARD_MODAL.bonus.validation.reasonRequired);
      return;
    }
    const { success, error } = await awardBonus({
      data: {
        imageId,
        userId,
        points: Number.parseInt(bonusPoints),
        reason: bonusReason.trim(),
        description: bonusDescription.trim(),
      },
    });
    if (success) {
      toast.success(IMAGE_REWARD_MODAL.bonus.success);
      setShowBonusForm(false);
      setBonusPoints("");
      setBonusReason("");
      setBonusDescription("");
      fetchSummary();
      fetchTransactions();
    } else {
      toast.error(error || IMAGE_REWARD_MODAL.bonus.error);
    }
  };

  const summary = summaryData?.data;
  const transactions = transactionsData?.data?.data || [];
  const totalPages = transactionsData?.data?.totalPages || 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      customWidth="720px"
      data-testid="image-reward-modal"
    >
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <div className={styles["modal-header-left"]}>
            <h2 className={styles["modal-title"]}>
              {IMAGE_REWARD_MODAL.title}
            </h2>
            <p className={styles["modal-subtitle"]}>
              {imageName || IMAGE_REWARD_MODAL.subtitle}
            </p>
          </div>
          {userId && (
            <button
              type="button"
              className={styles["bonus-btn"]}
              onClick={() => setShowBonusForm((prev) => !prev)}
            >
              {showBonusForm ? "Cancel" : IMAGE_REWARD_MODAL.bonus.button}
            </button>
          )}
        </div>

        <div className={styles["summary-section"]}>
          {(() => {
            if (summaryLoading) {
              return (
                <div className={styles["loading-container"]}>
                  <LoadingSpinner size={32} border={3} color="var(--primary)" />
                </div>
              );
            }
            if (summary) {
              return (
                <div className={styles["summary-grid"]}>
                  <div className={styles["stat-card"]}>
                    <span className={styles["stat-value"]}>
                      {summary.uniqueProUsersCount || 0}
                    </span>
                    <span className={styles["stat-label"]}>
                      {IMAGE_REWARD_MODAL.summary.proUsers}
                    </span>
                  </div>
                  <div className={styles["stat-card"]}>
                    <span className={styles["stat-value"]}>
                      {summary.totalPointsAwarded || 0}
                    </span>
                    <span className={styles["stat-label"]}>
                      {IMAGE_REWARD_MODAL.summary.totalPoints}
                    </span>
                  </div>
                  <div className={styles["stat-card"]}>
                    <span className={styles["stat-value"]}>
                      {summary.milestonesAchieved?.length || 0}
                    </span>
                    <span className={styles["stat-label"]}>
                      {IMAGE_REWARD_MODAL.summary.milestones}
                    </span>
                  </div>
                  <div className={styles["stat-card"]}>
                    <span className={styles["stat-value"]}>
                      {summary.nextMilestone || "—"}
                    </span>
                    <span className={styles["stat-label"]}>
                      {IMAGE_REWARD_MODAL.summary.nextMilestone}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <p className={styles["empty-state"]}>No reward data available.</p>
            );
          })()}
        </div>

        {showBonusForm && (
          <div className={styles["bonus-section"]}>
            <h3 className={styles["section-title"]}>
              {IMAGE_REWARD_MODAL.bonus.confirmButton}
            </h3>
            <div className={styles["bonus-form"]}>
              <div className={styles["bonus-field"]}>
                <label className={styles["bonus-label"]}>
                  {IMAGE_REWARD_MODAL.bonus.pointsLabel}
                </label>
                <input
                  type="number"
                  className={styles["bonus-input"]}
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(e.target.value)}
                  placeholder="50"
                  min="1"
                />
              </div>
              <div className={styles["bonus-field"]}>
                <label className={styles["bonus-label"]}>
                  {IMAGE_REWARD_MODAL.bonus.reasonLabel}
                </label>
                <select
                  className={styles["bonus-select"]}
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  aria-label={IMAGE_REWARD_MODAL.bonus.reasonLabel}
                >
                  <option value="">
                    {IMAGE_REWARD_MODAL.bonus.reasonPlaceholder}
                  </option>
                  {IMAGE_REWARD_MODAL.bonus.reasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles["bonus-field"]}>
                <label className={styles["bonus-label"]}>
                  {IMAGE_REWARD_MODAL.bonus.descriptionLabel}
                </label>
                <textarea
                  className={styles["bonus-textarea"]}
                  value={bonusDescription}
                  onChange={(e) => setBonusDescription(e.target.value)}
                  placeholder={IMAGE_REWARD_MODAL.bonus.descriptionPlaceholder}
                  rows={3}
                />
              </div>
              <div className={styles["bonus-actions"]}>
                <button
                  type="button"
                  className={styles["bonus-cancel-btn"]}
                  onClick={() => setShowBonusForm(false)}
                  disabled={bonusSubmitting}
                >
                  {IMAGE_REWARD_MODAL.bonus.cancelButton}
                </button>
                <button
                  type="button"
                  className={styles["bonus-confirm-btn"]}
                  onClick={handleAwardBonus}
                  disabled={bonusSubmitting}
                >
                  {bonusSubmitting
                    ? IMAGE_REWARD_MODAL.bonus.submittingText
                    : IMAGE_REWARD_MODAL.bonus.confirmButton}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles["transactions-section"]}>
          <h3 className={styles["section-title"]}>
            {IMAGE_REWARD_MODAL.transactions.title}
          </h3>

          {(() => {
            if (transactionsLoading) {
              return (
                <div className={styles["loading-container"]}>
                  <LoadingSpinner size={32} border={3} color="var(--primary)" />
                </div>
              );
            }
            if (transactions.length === 0) {
              return (
                <p className={styles["empty-state"]}>
                  {IMAGE_REWARD_MODAL.transactions.emptyState}
                </p>
              );
            }
            return (
              <>
                <div className={styles["table-wrapper"]}>
                  <table className={styles["table"]}>
                    <thead>
                      <tr>
                        {IMAGE_REWARD_MODAL.transactions.headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
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
                          <td>
                            {tx.user_id?.name || tx.user_id?.email || "—"}
                          </td>
                          <td>{formatTransactionReason(tx.reason)}</td>
                          <td>{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className={styles["pagination"]}>
                    <button
                      type="button"
                      className={styles["page-btn"]}
                      disabled={page === 1 || transactionsLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <span className={styles["page-indicator"]}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className={styles["page-btn"]}
                      disabled={page === totalPages || transactionsLoading}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
}

ImageRewardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageId: PropTypes.string,
  imageName: PropTypes.string,
  userId: PropTypes.string,
};

export default ImageRewardModal;
