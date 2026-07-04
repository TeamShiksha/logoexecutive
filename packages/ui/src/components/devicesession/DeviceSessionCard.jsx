import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "../common/button/Button";
import styles from "./DeviceSessionCard.module.css";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "../../utils/Helpers";

function DeviceSessionCard({ isGuest }) {
  const [sessions, setSessions] = useState([]);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const toast = useToast();

  const { fetchRequest: fetchSessionsRequest, loading: loadingSessions } =
    useApi();
  const { fetchRequest: revokeSessionRequest } = useApi();
  const { fetchRequest: signoutOthersRequest } = useApi();

  const loadSessions = useCallback(async () => {
    const { success, data, error } = await fetchSessionsRequest({
      url: "/auth/sessions",
      method: "GET",
    });
    if (success && data?.sessions) {
      setSessions(data.sessions);
    } else if (error) {
      toast.error(error);
    }
  }, [fetchSessionsRequest, toast]);

  useEffect(() => {
    if (!isGuest) {
      loadSessions();
    }
  }, [isGuest, loadSessions]);

  const handleRevokeSession = async (sessionId) => {
    const { success, error } = await revokeSessionRequest({
      url: `/auth/sessions/${sessionId}`,
      method: "DELETE",
    });
    if (success) {
      toast.success("Session revoked successfully");
      loadSessions();
    } else {
      toast.error(error || "Failed to revoke session");
    }
  };

  const handleSignoutOthers = async () => {
    setIsRevokingAll(true);
    const { success, error } = await signoutOthersRequest({
      url: "/auth/signout/others",
      method: "POST",
    });
    if (success) {
      toast.success("Signed out from all other devices");
      loadSessions();
    } else {
      toast.error(error || "Failed to sign out other devices");
    }
    setIsRevokingAll(false);
  };

  return (
    <div className={styles["session-container"]}>
      {loadingSessions ? (
        <p className={styles["loading-text"]}>Loading sessions...</p>
      ) : (
        <>
          <div className={styles["sessions-list"]}>
            {sessions.length === 0 && !loadingSessions && (
              <p className={styles["loading-text"]}>No active sessions</p>
            )}
            {sessions.map((session) => (
              <div key={session.id} className={styles["session-item"]}>
                <div className={styles["session-info"]}>
                  <p className={styles["session-device"]}>
                    {session.deviceInfo
                      ? `${session.deviceInfo.browser || "Unknown"} on ${session.deviceInfo.os || "Unknown OS"}`
                      : "Unknown Device"}
                    {session.isCurrent && (
                      <span className={styles["current-badge"]}>
                        {" "}
                        (Current)
                      </span>
                    )}
                  </p>
                  <p className={styles["session-details"]}>
                    Last active:{" "}
                    {session.lastActiveAt
                      ? formatDate(session.lastActiveAt)
                      : "Unknown"}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="danger"
                    disabled={isGuest}
                    onClick={() => handleRevokeSession(session.id)}
                    className={styles["revoke-btn"]}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          {sessions.length > 1 && (
            <div className={styles["action-wrapper"]}>
              <Button
                variant="danger"
                disabled={isGuest || isRevokingAll}
                onClick={handleSignoutOthers}
                className={styles["revoke-all-btn"]}
              >
                {isRevokingAll
                  ? "Revoking..."
                  : "Sign Out From All Other Devices"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

DeviceSessionCard.propTypes = {
  isGuest: PropTypes.bool.isRequired,
};

export default DeviceSessionCard;
