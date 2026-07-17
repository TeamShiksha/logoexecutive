import PropTypes from "prop-types";
import styles from "./VersionCard.module.css";
import AvatarStack from "./AvatarStack";

function VersionCard({ entry }) {
  if (!entry) return null;

  const category = entry.category || "Update";
  const { prNumber, title, description } = entry;

  // Normalize single contributor and array of contributors for rendering
  const rawContributors = entry.contributors
    ? entry.contributors
    : entry.contributor
      ? [entry.contributor]
      : [];

  // Filter out contributors with incomplete data
  const contributors = rawContributors.filter((c) => c && c.username);

  // Determine category badge class dynamically
  const getCategoryClass = (catName) => {
    if (!catName) return styles["badge-default"];
    const formatted = catName.toLowerCase().replace(/\s+/g, "-");
    return styles[`badge-${formatted}`] || styles["badge-default"];
  };

  return (
    <div className={styles["entry-card"]}>
      <div className={styles["card-badges"]}>
        <span
          className={`${styles["badge-category"]} ${getCategoryClass(category)}`}
        >
          {category.toUpperCase()}
        </span>
        {prNumber && <span className={styles["badge-pr"]}>#{prNumber}</span>}
      </div>

      {title && <h3 className={styles["entry-title"]}>{title}</h3>}
      {description && (
        <p className={styles["entry-description"]}>{description}</p>
      )}

      {contributors.length > 0 && (
        <div className={styles["contributors-wrapper"]}>
          <AvatarStack users={contributors} size="small" />
        </div>
      )}
    </div>
  );
}

VersionCard.propTypes = {
  entry: PropTypes.shape({
    category: PropTypes.string,
    prNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    description: PropTypes.string,
    contributor: PropTypes.shape({
      username: PropTypes.string,
      avatarUrl: PropTypes.string,
      profileUrl: PropTypes.string,
    }),
    contributors: PropTypes.arrayOf(
      PropTypes.shape({
        username: PropTypes.string,
        avatarUrl: PropTypes.string,
        profileUrl: PropTypes.string,
      })
    ),
  }),
};

export default VersionCard;
