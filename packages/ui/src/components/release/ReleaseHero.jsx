import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { ArrowDown } from "lucide-react";
import styles from "./ReleaseHero.module.css";
import AvatarStack from "./AvatarStack";
import { HERO_IMAGE_MAP, LATEST_HERO_IMAGE } from "../../utils/Constants";

function ReleaseHero({ selectedRelease, contributors = [] }) {
  const cardRef = useRef(null);

  // Initial state: normal center perspective
  const defaultStyle = {
    transform:
      "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    boxShadow:
      "0 15px 35px rgba(0, 0, 0, 0.15), 0 -5px 15px rgba(0, 0, 0, 0.06)",
    transition:
      "transform 0.8s cubic-bezier(0.25, 1, 0.3, 1), box-shadow 0.8s cubic-bezier(0.25, 1, 0.3, 1)",
  };

  const [tiltStyle, setTiltStyle] = useState(defaultStyle);

  // Resolve the hero image for the selected release:
  //  - If the release has a heroImage key that exists in the map → use it
  //    (ensures old releases show the landing page that was live at that time)
  //  - Otherwise (null / unknown key / no selectedRelease) → fall back to the
  //    latest image, which is always the most up-to-date landing page screenshot
  const imageSrc =
    HERO_IMAGE_MAP[selectedRelease?.heroImage] ?? LATEST_HERO_IMAGE;

  // Handle 3D Tilt Effect on Mouse Move
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // cursor x relative to card
    const y = e.clientY - rect.top; // cursor y relative to card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation deviation (subtle max deviation of 2 degrees)
    const deltaX = ((centerY - y) / centerY) * 2; // ranges from -2 to 2
    const deltaY = ((x - centerX) / centerX) * 2; // ranges from -2 to 2

    // Base rotation is center (0deg)
    const rotateX = deltaX;
    const rotateY = deltaY;

    // Calculate shadow offset relative to cursor
    const shadowX = ((centerX - x) / centerX) * 8;
    const shadowY = ((centerY - y) / centerY) * 8 + 20; // 20px base shadow offset

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: `${shadowX}px ${shadowY}px 40px rgba(0, 0, 0, 0.25), 0 -5px 15px rgba(0, 0, 0, 0.06)`,
      transition:
        "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
    });
  };

  // Reset Tilt Effect on Mouse Leave to the baseline tilted/rotated state
  const handleMouseLeave = () => {
    setTiltStyle(defaultStyle);
  };

  const handleExploreChangelog = () => {
    const changelogSection = document.getElementById("changelog");
    if (changelogSection) {
      changelogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={styles["hero-section"]}>
      <div className={`${styles["hero-container"]} container`}>
        <div className={styles["hero-content"]}>
          <span className={styles["hero-badge"]}>RELEASE NOTES</span>
          <h1 className={styles["hero-title"]}>
            <span className={styles["gradient-text"]}>What&apos;s new</span> at
            <br />
            Openlogo
          </h1>
          <p className={styles["hero-subtitle"]}>
            Keep up with Openlogo&apos;s{" "}
            <span className={styles["highlight"]}>latest product news</span>. We{" "}
            <span className={styles["highlight"]}>ship fast</span>, so you can
            improve your{" "}
            <span className={styles["highlight"]}>
              logo integration process
            </span>{" "}
            faster!
          </p>
          <div className={styles["hero-cta"]}>
            <button
              type="button"
              className={styles["cta-primary"]}
              onClick={handleExploreChangelog}
            >
              Explore Changelog <ArrowDown size={16} />
            </button>
          </div>

          {contributors && contributors.length > 0 && (
            <div className={styles["contributors-wrapper"]}>
              <AvatarStack users={contributors} size="large" />{" "}
              <span className={styles["contributors-text"]}>
                Meet the team behind <strong>{selectedRelease?.version}</strong>
              </span>
            </div>
          )}
        </div>
        <div className={styles["hero-visual"]}>
          <div
            ref={cardRef}
            className={styles["mockup-wrapper"]}
            style={tiltStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={imageSrc}
              alt="Openlogo UI Mockup"
              className={styles["mockup-image"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

ReleaseHero.propTypes = {
  selectedRelease: PropTypes.shape({
    version: PropTypes.string,
    releaseDate: PropTypes.string,
    heroImage: PropTypes.string,
  }),
  contributors: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      avatarUrl: PropTypes.string,
      profileUrl: PropTypes.string,
    })
  ),
};

export default ReleaseHero;
