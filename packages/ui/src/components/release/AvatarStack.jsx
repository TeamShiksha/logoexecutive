import PropTypes from "prop-types";
import styles from "./AvatarStack.module.css";

function AvatarStack({ users = [], size = "large", maxCount = 5 }) {
  if (!users || users.length === 0) return null;

  const isSingle = users.length === 1;
  const visibleUsers = users.slice(0, maxCount);
  const excessCount = users.length - maxCount;

  const containerClass = `${styles["avatar-group"]} ${isSingle ? styles["single"] : ""} ${styles[size]}`;

  return (
    <div className={containerClass}>
      {visibleUsers.map((user, idx) => (
        <div
          key={`${user.username}-${idx}`}
          className={`${styles["avatar-wrapper"]} ${user.isAuthor ? styles["author-wrapper"] : ""}`}
          style={{ zIndex: users.length - idx }}
          data-tooltip={user.isAuthor ? `${user.username}` : `${user.username}`}
        >
          <a
            href={user.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles["avatar-link"]}
          >
            <img
              src={user.avatarUrl}
              alt={user.username}
              className={`${styles["avatar-image"]} ${user.isAuthor ? styles["author-image"] : ""}`}
              onError={(e) => {
                e.target.src = `https://unavatar.io/github/${user.username}`;
              }}
            />
          </a>
        </div>
      ))}
      {excessCount > 0 && (
        <div
          className={styles["avatar-excess"]}
          style={{ zIndex: 0 }}
          data-tooltip={`And ${excessCount} more contributors`}
        >
          +{excessCount}
        </div>
      )}
    </div>
  );
}

AvatarStack.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string.isRequired,
      profileUrl: PropTypes.string.isRequired,
    })
  ),
  size: PropTypes.oneOf(["small", "large"]),
  maxCount: PropTypes.number,
};

export default AvatarStack;
