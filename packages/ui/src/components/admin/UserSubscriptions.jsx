import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useApi } from "../../hooks/useApi";
import { instance } from "../../api/api_instance";
import { useToast } from "../../hooks/useToast";
import Modal from "../common/modal/Modal.jsx";
import Button from "../common/button/Button.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import CustomInput from "../common/input/CustomInput.jsx";
import styles from "./UserSubscriptions.module.css";
import { USER_SUBSCRIPTIONS } from "../../utils/Constants.js";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

const PLANS = ["HOBBY", "PRO"];
const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PlanBadge({ plan }) {
  const badgeClass =
    plan === "PRO" ? styles["plan-badge-pro"] : styles["plan-badge-hobby"];
  const label = USER_SUBSCRIPTIONS.plans[plan] ?? plan;
  return (
    <span className={`${styles["plan-badge"]} ${badgeClass}`}>{label}</span>
  );
}

PlanBadge.propTypes = {
  plan: PropTypes.string.isRequired,
};

function renderTable(loading, initialized, users, styles, handleOpenModal) {
  if (loading || !initialized) {
    return (
      <div className={styles["loading-container"]}>
        <LoadingSpinner size={36} border={3} color="var(--primary)" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className={styles["empty-state"]}>{USER_SUBSCRIPTIONS.emptyState}</p>
    );
  }

  return (
    <div className={styles["table-wrapper"]}>
      <table className={styles.table}>
        <thead>
          <tr>
            {USER_SUBSCRIPTIONS.tableHeaders.map((h) => (
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
                {user.created_at && (
                  <p className={styles["user-joined"]}>
                    Joined {formatDate(user.created_at)}
                  </p>
                )}
              </td>

              <td>
                <PlanBadge plan={user.subscription?.type ?? "HOBBY"} />
              </td>

              <td>
                <span className={styles["usage-text"]}>
                  {user.subscription?.usage_count ?? 0}
                  {" / "}
                  {user.subscription?.usage_limit ?? "—"}
                </span>
              </td>

              <td className={styles["menu-cell"]}>
                <button
                  className={styles["menu-btn"]}
                  aria-label="Row actions"
                  title="Change Plan"
                  onClick={() => handleOpenModal(user)}
                >
                  <MoreVertical size={16} aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserSubscriptions({ embedded = false }) {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPlan, setNewPlan] = useState("");
  const [reason, setReason] = useState("");

  const searchParam = debouncedSearch
    ? `&search=${encodeURIComponent(debouncedSearch)}`
    : "";
  const { fetchRequest, loading } = useApi({
    method: "GET",
    url: `/admin/users?page=${page}&limit=${ITEMS_PER_PAGE}${searchParam}`,
  });

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

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setNewPlan(user.subscription?.type ?? "HOBBY");
    setReason("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setNewPlan("");
    setReason("");
  };

  const handleConfirmChange = async () => {
    if (!selectedUser || !newPlan) return;

    const userId = selectedUser._id;
    const previousPlan = selectedUser.subscription?.type;
    const planToSet = newPlan;
    const reasonToSend = reason;

    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId
          ? { ...u, subscription: { ...u.subscription, type: planToSet } }
          : u
      )
    );

    handleCloseModal();

    try {
      const { data: response } = await instance({
        method: "PATCH",
        url: `/admin/users/${userId}/subscription`,
        data: {
          plan: planToSet,
          ...(reasonToSend && { reason: reasonToSend }),
        },
      });
      if (response?.data) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, subscription: response.data } : u
          )
        );
      }
      toast.success(USER_SUBSCRIPTIONS.toasts.success);
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, subscription: { ...u.subscription, type: previousPlan } }
            : u
        )
      );
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        USER_SUBSCRIPTIONS.toasts.error;
      toast.error(msg);
    }
  };

  const isCurrentPlan = selectedUser?.subscription?.type === newPlan;

  return (
    <div
      className={embedded ? undefined : styles.panel}
      data-testid="user-subscriptions-panel"
    >
      <div className={styles["panel-header"]}>
        <div className={styles["panel-title-group"]}>
          <h2 className={styles["panel-title"]}>{USER_SUBSCRIPTIONS.title}</h2>
          <p className={styles["panel-subtitle"]}>
            {USER_SUBSCRIPTIONS.subtitle}
          </p>
        </div>

        <div className={styles["search-wrapper"]}>
          <CustomInput
            type="search"
            name="userSearch"
            label={USER_SUBSCRIPTIONS.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {renderTable(loading, initialized, users, styles, handleOpenModal)}

      {totalPages > 1 && (
        <div className={styles.pagination}>
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customWidth="400px"
        data-testid="change-plan-modal"
      >
        <div className={styles["modal-body"]}>
          <div>
            <h2 className={styles["modal-title"]}>
              {USER_SUBSCRIPTIONS.modal.title}
            </h2>
            {selectedUser && (
              <p className={styles["modal-user-info"]}>
                {selectedUser.name} &mdash; {selectedUser.email}
              </p>
            )}
          </div>

          <div>
            <span className={styles["modal-label"]}>
              {USER_SUBSCRIPTIONS.modal.planLabel}
            </span>
            <div className={styles["plan-selector"]}>
              {PLANS.map((plan) => (
                <button
                  key={plan}
                  type="button"
                  className={`${styles["plan-option"]} ${
                    newPlan === plan ? styles["plan-option-selected"] : ""
                  }`}
                  onClick={() => setNewPlan(plan)}
                >
                  {USER_SUBSCRIPTIONS.plans[plan]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={styles["modal-label"]}>
              {USER_SUBSCRIPTIONS.modal.reasonLabel}
            </span>
            <textarea
              className={styles["reason-textarea"]}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={USER_SUBSCRIPTIONS.modal.reasonPlaceholder}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className={styles["modal-actions"]}>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmChange}
              disabled={isCurrentPlan}
            >
              {USER_SUBSCRIPTIONS.modal.confirmButton}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

UserSubscriptions.propTypes = {
  embedded: PropTypes.bool,
};

export default UserSubscriptions;
