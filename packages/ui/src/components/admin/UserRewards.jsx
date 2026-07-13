import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import CustomInput from "../common/input/CustomInput.jsx";
import Modal from "../common/modal/Modal.jsx";
import { ADMIN_USER_REWARDS } from "../../utils/Constants.js";
import { ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import styles from "./UserRewards.module.css";

const ITEMS_PER_PAGE = 10;
const TRANSACTIONS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;

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

function UserRewards() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseTransaction, setReverseTransaction] = useState(null);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseSubmitting, setReverseSubmitting] = useState(false);

  const searchParam = debouncedSearch
    ? `&search=${encodeURIComponent(debouncedSearch)}`
    : "";
  const { fetchRequest, loading } = useApi({
    method: "GET",
    url: `/admin/users?page=${page}&limit=${ITEMS_PER_PAGE}${searchParam}&hasRewardPoints=true`,
  });

  const { fetchRequest: fetchTransactions } = useApi({
    method: "GET",
    url: `/admin/rewards/transactions/search?userId=${selectedUser?._id}&page=${txPage}&limit=${TRANSACTIONS_PER_PAGE}`,
  });

  const { fetchRequest: reverseTx } = useApi({
    method: "POST",
    url: reverseTransaction
      ? `/admin/rewards/transactions/${reverseTransaction._id}/reverse`
      : "",
  });

  const loadTransactions = async () => {
    if (!selectedUser) return;
    setTxLoading(true);
    const { success, data, error } = await fetchTransactions();
    if (success && data) {
      setTransactions(data.data?.data ?? []);
      setTxTotalPages(data.data?.totalPages ?? 1);
    } else if (error) {
      toast.error(ADMIN_USER_REWARDS.toasts.loadError);
    }
    setTxLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      const { success, data, error } = await fetchRequest();
      if (success && data) {
        setUsers(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
        if (page > (data.totalPages ?? 1)) {
          setPage(1);
        }
      } else if (error) {
        toast.error(error);
      }
      setInitialized(true);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, txPage]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setTxPage(1);
    setTransactions([]);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setTransactions([]);
    setTxPage(1);
  };

  const handleOpenReverseModal = (tx) => {
    setReverseTransaction(tx);
    setReverseReason("");
    setShowReverseModal(true);
  };

  const handleCloseReverseModal = () => {
    setShowReverseModal(false);
    setReverseTransaction(null);
    setReverseReason("");
  };

  const handleReverseTransaction = async () => {
    if (!reverseReason.trim()) {
      toast.error(ADMIN_USER_REWARDS.reverseModal.validation.reasonRequired);
      return;
    }
    setReverseSubmitting(true);
    const { success, error } = await reverseTx({
      data: { reason: reverseReason.trim() },
    });
    setReverseSubmitting(false);
    if (success) {
      toast.success(ADMIN_USER_REWARDS.reverseModal.success);
      handleCloseReverseModal();
      loadTransactions();
    } else {
      toast.error(error || ADMIN_USER_REWARDS.reverseModal.error);
    }
  };

  if (selectedUser) {
    return (
      <>
        <div className={styles["detail-view"]}>
          <div className={styles["detail-header"]}>
            <button
              type="button"
              className={styles["back-btn"]}
              onClick={handleBackToList}
            >
              <ChevronLeft size={18} aria-hidden="true" />
              Back to Users
            </button>
            <div className={styles["user-info"]}>
              <h3 className={styles["user-name"]}>
                {selectedUser.name || "—"}
              </h3>
              <p className={styles["user-email"]}>{selectedUser.email}</p>
            </div>
          </div>

          {txLoading ? (
            <div className={styles["loading-container"]}>
              <LoadingSpinner size={36} border={3} color="var(--primary)" />
            </div>
          ) : (
            <div className={styles["history-section"]}>
              <h4 className={styles["history-title"]}>
                {ADMIN_USER_REWARDS.detail.historyTitle}
              </h4>
              {transactions.length === 0 ? (
                <p className={styles["empty-state"]}>
                  {ADMIN_USER_REWARDS.detail.emptyHistory}
                </p>
              ) : (
                <>
                  <div className={styles["table-wrapper"]}>
                    <table className={styles["table"]}>
                      <thead>
                        <tr>
                          {ADMIN_USER_REWARDS.detail.historyHeaders.map((h) => (
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
                            <td>{formatTransactionReason(tx.reason)}</td>
                            <td>{formatDate(tx.createdAt)}</td>
                            <td className={styles["action-cell"]}>
                              {!tx.is_reversed &&
                                tx.transaction_type !== "REVERSAL" && (
                                  <button
                                    type="button"
                                    className={styles["reverse-btn"]}
                                    onClick={() => handleOpenReverseModal(tx)}
                                    aria-label="Reverse transaction"
                                    title="Reverse transaction"
                                  >
                                    <RotateCcw size={14} aria-hidden="true" />
                                  </button>
                                )}
                            </td>
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
              )}
            </div>
          )}
        </div>

        <Modal
          isOpen={showReverseModal}
          onClose={handleCloseReverseModal}
          customWidth="480px"
        >
          <div className={styles["modal-body"]}>
            <h3 className={styles["modal-title"]}>
              {ADMIN_USER_REWARDS.reverseModal.title}
            </h3>
            <p className={styles["modal-description"]}>
              {reverseTransaction &&
                ADMIN_USER_REWARDS.reverseModal.description(
                  reverseTransaction.points_awarded,
                  formatTransactionType(reverseTransaction.transaction_type)
                )}
            </p>
            <div className={styles["modal-field"]}>
              <label className={styles["modal-label"]}>
                {ADMIN_USER_REWARDS.reverseModal.reasonLabel}
              </label>
              <select
                className={styles["modal-select"]}
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                aria-label={ADMIN_USER_REWARDS.reverseModal.reasonLabel}
              >
                <option value="">
                  {ADMIN_USER_REWARDS.reverseModal.reasonPlaceholder}
                </option>
                {ADMIN_USER_REWARDS.reverseModal.reversalReasonOptions.map(
                  (opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className={styles["modal-actions"]}>
              <button
                type="button"
                className={styles["modal-cancel-btn"]}
                onClick={handleCloseReverseModal}
                disabled={reverseSubmitting}
              >
                {ADMIN_USER_REWARDS.reverseModal.cancelButton}
              </button>
              <button
                type="button"
                className={styles["modal-confirm-btn"]}
                onClick={handleReverseTransaction}
                disabled={reverseSubmitting}
              >
                {reverseSubmitting
                  ? ADMIN_USER_REWARDS.reverseModal.submittingText
                  : ADMIN_USER_REWARDS.reverseModal.confirmButton}
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className={styles.panel} data-testid="user-rewards-panel">
      <div className={styles["panel-header"]}>
        <div className={styles["panel-title-group"]}>
          <h2 className={styles["panel-title"]}>{ADMIN_USER_REWARDS.title}</h2>
          <p className={styles["panel-subtitle"]}>
            {ADMIN_USER_REWARDS.subtitle}
          </p>
        </div>

        <div className={styles["search-wrapper"]}>
          <CustomInput
            type="search"
            name="userSearch"
            label={ADMIN_USER_REWARDS.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {(() => {
        if (loading || !initialized) {
          return (
            <div className={styles["loading-container"]}>
              <LoadingSpinner size={36} border={3} color="var(--primary)" />
            </div>
          );
        }
        if (users.length === 0) {
          return (
            <p className={styles["empty-state"]}>
              {ADMIN_USER_REWARDS.emptyState}
            </p>
          );
        }
        return (
          <div className={styles["table-wrapper"]}>
            <table className={styles["table"]}>
              <thead>
                <tr>
                  {ADMIN_USER_REWARDS.tableHeaders.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <p className={styles["user-name"]}>{user.name ?? "—"}</p>
                      <p className={styles["user-email"]}>{user.email}</p>
                    </td>
                    <td>
                      <span
                        className={`${styles["plan-badge"]} ${
                          user.subscription?.type === "PRO"
                            ? styles["plan-badge-pro"]
                            : styles["plan-badge-hobby"]
                        }`}
                      >
                        {user.subscription?.type ?? "HOBBY"}
                      </span>
                    </td>
                    <td>
                      <span className={styles["points-text"]}>
                        {user.reward_points_current ?? 0}
                      </span>
                    </td>
                    <td className={styles["menu-cell"]}>
                      <button
                        className={styles["view-btn"]}
                        aria-label="View rewards"
                        title="View rewards"
                        onClick={() => handleSelectUser(user)}
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {totalPages > 1 && (
        <div className={styles["pagination"]}>
          <button
            type="button"
            className={styles["page-btn"]}
            disabled={page === 1 || loading}
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
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default UserRewards;
