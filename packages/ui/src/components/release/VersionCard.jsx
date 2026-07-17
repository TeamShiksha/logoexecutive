import PropTypes from "prop-types";
import styles from "./VersionCard.module.css";
import AvatarStack from "./AvatarStack";

function VersionCard({ entry }) {
  const { category, prNumber, title, description } = entry;

  // Normalize single contributor and array of contributors for rendering
  const contributors = entry.contributors
    ? entry.contributors
    : entry.contributor
      ? [entry.contributor]
      : [];

  // Determine category badge class dynamically
  const getCategoryClass = (catName) => {
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

      <h3 className={styles["entry-title"]}>{title}</h3>
      <p className={styles["entry-description"]}>{description}</p>

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
    category: PropTypes.string.isRequired,
    prNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    contributor: PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatarUrl: PropTypes.string.isRequired,
      profileUrl: PropTypes.string.isRequired,
    }),
    contributors: PropTypes.arrayOf(
      PropTypes.shape({
        username: PropTypes.string.isRequired,
        avatarUrl: PropTypes.string.isRequired,
        profileUrl: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default VersionCard;
