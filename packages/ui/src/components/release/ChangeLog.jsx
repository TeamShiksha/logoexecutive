import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ChangeLog.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";
import VersionCard from "./VersionCard";

function ChangeLog({
  releaseData,
  selectedVersion,
  setSelectedVersion,
  selectedRelease,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Reset active filter when changing release versions
  useEffect(() => {
    setActiveCategory("All");
  }, [selectedVersion]);

  const ALLOWED_CATEGORIES = ["Feature", "UI Update", "Security", "Bug Fix"];

  // Extract unique allowed categories for filter pills from the selected release's entries
  const availableCategories = selectedRelease
    ? [
        "All",
        ...ALLOWED_CATEGORIES.filter((cat) =>
          selectedRelease.entries.some((e) => e.category === cat)
        ),
      ]
    : ["All"];

  // Filter entries based on the active category pill
  const filteredEntries = selectedRelease
    ? selectedRelease.entries.filter(
        (entry) => activeCategory === "All" || entry.category === activeCategory
      )
    : [];

  return (
    <section
      id="changelog"
      className={`${styles["changelog-section"]} container`}
    >
      <div className={styles["changelog-header"]}>
        <h2 className={styles["changelog-title"]}>Changelog</h2>
        <div className={styles["dropdown-wrapper"]}>
          <button
            className={styles["dropdown-trigger"]}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{selectedRelease?.releaseDate || "Select Release"}</span>
            {isDropdownOpen ? (
              <ChevronUp className={styles["dropdown-icon"]} />
            ) : (
              <ChevronDown className={styles["dropdown-icon"]} />
            )}
          </button>

          {isDropdownOpen && (
            <div className={styles["dropdown-menu"]}>
              {releaseData.map((release) => (
                <button
                  key={release.version}
                  className={`${styles["dropdown-item"]} ${
                    release.version === selectedVersion ? styles["active"] : ""
                  }`}
                  onClick={() => {
                    setSelectedVersion(release.version);
                    setIsDropdownOpen(false);
                  }}
                >
                  {release.releaseDate} ({release.version})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles["changelog-layout"]}>
        {/* Timeline Column */}
        <div className={styles["timeline-column"]}>
          <span className={styles["timeline-date"]}>
            {selectedRelease?.releaseDate?.toUpperCase()}
          </span>
          <div className={styles["timeline-dot-wrapper"]}>
            <div className={styles["timeline-dot-halo"]}>
              <div className={styles["timeline-dot-inner"]}></div>
            </div>
            <div className={styles["timeline-connector-line"]}></div>
          </div>
        </div>

        {/* Content Column */}
        <div className={styles["content-column"]}>
          {/* Category Filter Pills */}
          <div className={styles["filters-container"]}>
            {availableCategories.map((category) => (
              <button
                key={category}
                className={`${styles["filter-pill"]} ${
                  activeCategory === category
                    ? styles["filter-pill-active"]
                    : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Cards List Container */}
          <div className={styles["cards-list-box"]}>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <VersionCard key={`${entry.prNumber}-${index}`} entry={entry} />
              ))
            ) : (
              <div className={styles["no-entries"]}>
                No updates in this category for this release.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

ChangeLog.propTypes = {
  releaseData: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      releaseDate: PropTypes.string.isRequired,
      heroImage: PropTypes.string,
      entries: PropTypes.array.isRequired,
    })
  ).isRequired,
  selectedVersion: PropTypes.string.isRequired,
  setSelectedVersion: PropTypes.func.isRequired,
  selectedRelease: PropTypes.shape({
    version: PropTypes.string.isRequired,
    releaseDate: PropTypes.string.isRequired,
    heroImage: PropTypes.string,
    entries: PropTypes.array.isRequired,
  }),
};

export default ChangeLog;
