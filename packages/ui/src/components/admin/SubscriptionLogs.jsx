import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import styles from "./UserSubscriptions.module.css"; // reuse shared table/badge/pagination styles
import { SUBSCRIPTION_LOGS } from "../../utils/Constants.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10;

function PlanBadge({ plan }) {
  const badgeClass =
    plan === "PRO" ? styles["plan-badge-pro"] : styles["plan-badge-hobby"];
  const label = SUBSCRIPTION_LOGS.plans[plan] ?? plan;
  return (
    <span className={`${styles["plan-badge"]} ${badgeClass}`}>{label}</span>
  );
}

PlanBadge.propTypes = {
  plan: PropTypes.string.isRequired,
};

function UserInfo({ user }) {
  return (
    <>
      <p className={styles["user-name"]}>{user?.name ?? "—"}</p>
      <p className={styles["user-email"]}>{user?.email ?? "—"}</p>
    </>
  );
}

UserInfo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
};

function UsageText({ children }) {
  return <span className={styles["usage-text"]}>{children}</span>;
}

UsageText.propTypes = {
  children: PropTypes.node.isRequired,
};

function PaginationButton({ label, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className={styles["page-btn"]}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}

PaginationButton.propTypes = {
  label: PropTypes.node.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
};

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderContent(loading, initialized, logs) {
  if (loading || !initialized) {
    return (
      <div className={styles["loading-container"]}>
        <LoadingSpinner size={36} border={3} color="var(--primary)" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className={styles["empty-state"]}>{SUBSCRIPTION_LOGS.emptyState}</p>
    );
  }

  return (
    <div className={styles["table-wrapper"]}>
      <table className={styles.table}>
        <thead>
          <tr>
            {SUBSCRIPTION_LOGS.tableHeaders.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                <UsageText>{formatDate(log.createdAt)}</UsageText>
              </td>

              <td>
                <UserInfo user={log.user_id} />
              </td>

              <td>
                <UserInfo user={log.changed_by} />
              </td>

              <td>
                <PlanBadge plan={log.from_plan} />
              </td>

              <td>
                <PlanBadge plan={log.to_plan} />
              </td>

              <td>
                <UsageText>{log.reason ?? "—"}</UsageText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionLogs() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const { fetchRequest, loading } = useApi({
    method: "GET",
    url: `/admin/users/subscription/logs?page=${page}&limit=${ITEMS_PER_PAGE}`,
  });

  useEffect(() => {
    const load = async () => {
      const { success, data, error } = await fetchRequest();
      if (success && data) {
        setLogs(data.data ?? []);
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
  }, [page]);

  return (
    <div data-testid="subscription-logs-panel">
      <div className={styles["panel-header"]}>
        <div className={styles["panel-title-group"]}>
          <h2 className={styles["panel-title"]}>{SUBSCRIPTION_LOGS.title}</h2>
          <p className={styles["panel-subtitle"]}>
            {SUBSCRIPTION_LOGS.subtitle}
          </p>
        </div>
      </div>

      {renderContent(loading, initialized, logs)}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <PaginationButton
            label={<ChevronLeft size={16} aria-hidden="true" />}
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            ariaLabel="Previous page"
          />
          <span className={styles["page-indicator"]}>
            Page {page} of {totalPages}
          </span>
          <PaginationButton
            label={<ChevronRight size={16} aria-hidden="true" />}
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            ariaLabel="Next page"
          />
        </div>
      )}
    </div>
  );
}

export default SubscriptionLogs;
