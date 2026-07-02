import { useEffect } from "react";
import PropTypes from "prop-types";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import Button from "../common/button/Button.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";
import { LEADERBOARD_PAGE } from "../../utils/Constants.js";
import { ChevronLeft, Trophy, Medal } from "lucide-react";
import styles from "./LeaderboardView.module.css";

function LeaderboardView({ onBack }) {
  const toast = useToast();

  const {
    fetchRequest: fetchLeaderboard,
    data: leaderboardData,
    loading: leaderboardLoading,
  } = useApi({
    method: "GET",
    url: "/rewards/leaderboard?limit=10",
  });

  const {
    fetchRequest: fetchRank,
    data: rankData,
    loading: rankLoading,
  } = useApi({
    method: "GET",
    url: "/rewards/leaderboard/rank",
  });

  useEffect(() => {
    fetchLeaderboard().then(({ success, error }) => {
      if (!success && error) {
        toast.error(LEADERBOARD_PAGE.toasts.loadError);
      }
    });
    fetchRank().then(({ success, error }) => {
      if (!success && error) {
        toast.error(LEADERBOARD_PAGE.toasts.rankError);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaderboard = leaderboardData?.data || [];
  const userRank = rankData?.data;
  const isLoading = leaderboardLoading || rankLoading;

  return (
    <div className={styles["leaderboard-container"]}>
      <div className={styles["leaderboard-header"]}>
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={16} />
          {LEADERBOARD_PAGE.backToRewards}
        </Button>
        <div>
          <h2 className={styles["leaderboard-title"]}>
            {LEADERBOARD_PAGE.title}
          </h2>
          <p className={styles["leaderboard-subtitle"]}>
            {LEADERBOARD_PAGE.subtitle}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles["loading-container"]}>
          <LoadingSpinner size={40} border={4} color="var(--primary)" />
        </div>
      ) : (
        <>
          <div className={styles["leaderboard-table-section"]}>
            {leaderboard.length > 0 ? (
              <div className={styles["table-wrapper"]}>
                <table className={styles["table"]}>
                  <thead>
                    <tr>
                      {LEADERBOARD_PAGE.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr
                        key={entry.userId}
                        className={
                          userRank && entry.userId === userRank.userId
                            ? styles["highlight-row"]
                            : ""
                        }
                      >
                        <td>
                          <span
                            className={`${styles["rank-badge"]} ${
                              entry.rank <= 3
                                ? styles[`rank-${entry.rank}`]
                                : ""
                            }`}
                          >
                            {entry.rank <= 3 ? <Trophy size={14} /> : null}#
                            {entry.rank}
                          </span>
                        </td>
                        <td>
                          <div className={styles["user-info"]}>
                            <span className={styles["user-name"]}>
                              {entry.name || "Unknown"}
                            </span>
                            <span className={styles["user-email"]}>
                              {entry.email}
                            </span>
                          </div>
                        </td>
                        <td className={styles["points-cell"]}>
                          {entry.totalPointsAwarded}
                        </td>
                        <td>{entry.milestonesAchieved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles["empty-state"]}>
                {LEADERBOARD_PAGE.emptyState}
              </p>
            )}
          </div>

          {userRank && userRank.rank !== null && (
            <div className={styles["your-position-card"]}>
              <div className={styles["position-header"]}>
                <Medal size={24} className={styles["position-icon"]} />
                <h3 className={styles["position-title"]}>
                  {LEADERBOARD_PAGE.yourPosition}
                </h3>
              </div>
              <div className={styles["position-stats"]}>
                <div className={styles["position-stat"]}>
                  <span className={styles["position-rank"]}>
                    #{userRank.rank}
                  </span>
                  <span className={styles["position-label"]}>Rank</span>
                </div>
                <div className={styles["position-stat"]}>
                  <span className={styles["position-value"]}>
                    {userRank.totalPoints}
                  </span>
                  <span className={styles["position-label"]}>Points</span>
                </div>
                <div className={styles["position-stat"]}>
                  <span className={styles["position-value"]}>
                    {userRank.rank} {LEADERBOARD_PAGE.outOf}{" "}
                    {userRank.totalUsers}
                  </span>
                  <span className={styles["position-label"]}>
                    {LEADERBOARD_PAGE.users}
                  </span>
                </div>
              </div>
            </div>
          )}

          {userRank?.rank === null && (
            <div className={styles["not-ranked-card"]}>
              <p className={styles["not-ranked-text"]}>
                {LEADERBOARD_PAGE.notRanked}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

LeaderboardView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default LeaderboardView;
