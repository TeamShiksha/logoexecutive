import PropTypes from "prop-types";
import { HERO_SECTION, BUTTON_TEXT } from "../../utils/Constants";
import styles from "./HeroSection.module.css";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Code } from "lucide-react";

const HeroSection = ({ onPrimaryButtonClick, isAuthenticated }) => {
  const navigate = useNavigate();

  return (
    <div id="home" data-testid="home" className={styles["hero-section"]}>
      <div className={`container ${styles["hero-inner"]}`}>
        <div className={styles["hero-content"]}>
          <div className={styles["text-section"]}>
            <h1>
              {HERO_SECTION.tagLine}{" "}
              <span className={styles.highlight}>
                {HERO_SECTION.tagLineHighlight}
              </span>
            </h1>
            <p>{HERO_SECTION.summary}</p>

            <div className={styles["button-section"]}>
              <button
                type="button"
                className={styles["primary-button"]}
                onClick={onPrimaryButtonClick}
              >
                {isAuthenticated
                  ? BUTTON_TEXT.gotoDashboard
                  : "Start Building for Free"}
                <ArrowRight size={18} className={styles["btn-icon"]} />
              </button>
              <button
                type="button"
                className={styles["secondary-button"]}
                onClick={() => navigate("/docs")}
              >
                <Code size={18} />
                View Documentation
              </button>
            </div>
          </div>

          <div className={styles["image-section"]}>
            <div className={styles["hero-image-wrapper"]}>
              <div className={styles["glow-effect"]}></div>
              <img
                src={HERO_SECTION.illustractionSrc}
                alt={HERO_SECTION.illustractionSrcAlt}
                className={styles["hero-image"]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroSection.propTypes = {
  onPrimaryButtonClick: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

export default HeroSection;
