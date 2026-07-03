import PropTypes from "prop-types";
import tickIcon from "../../assets/Icon.svg";
import Button from "../common/button/Button";
import { BUTTON_TEXT } from "../../utils/Constants";
import styles from "./PricingCard.module.css";

function PricingCard({
  name,
  tagline,
  index,
  pricing,
  keypoints,
  activePlan,
  openAuthModal,
}) {
  const isPro = index === 1;
  const isPlanActive = activePlan === name;

  let buttonText = BUTTON_TEXT.getStarted;
  if (isPlanActive) {
    buttonText = BUTTON_TEXT.active;
  } else if (isPro) {
    buttonText = "Upgrade to Pro";
  }

  // const isDisabled = isPlanActive || isPro;

  return (
    <div className={`${styles.card} ${isPro ? styles.dark : styles.light}`}>
      {isPro && <div className={styles.ribbon}>Coming Soon</div>}

      {isPro ? (
        <>
          <div className={styles.blurOverlay}>
            <p className={styles["plan-name"]}>PRO</p>
            <div className={styles["price-row"]}>
              <span
                className={styles.placeholderBar}
                style={{ width: "80px", height: "3rem" }}
              />
              <span
                className={styles.placeholderBar}
                style={{ width: "60px", height: "1rem" }}
              />
            </div>
            <ul className={styles.keypoints}>
              {[...Array(5)].map((_, idx) => (
                <li key={idx}>
                  <span className={styles.placeholderDot} />
                  <span
                    className={styles.placeholderBar}
                    style={{
                      width: `${70 + ((idx * 7) % 30)}%`,
                      height: "0.9rem",
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="primary"
            className={styles["btn-full"]}
            disabled={true}
          >
            Upgrade to Pro
          </Button>
        </>
      ) : (
        <>
          <p className={styles["plan-name"]}>{name}</p>
          <div className={styles["price-row"]}>
            <span className={styles.price}>
              {pricing === 0 ? "Free" : `$${pricing}`}
            </span>
            <span className={styles["price-period"]}>
              {pricing === 0 ? "forever" : tagline.replace(`$${pricing} `, "")}
            </span>
          </div>
          <ul className={styles.keypoints}>
            {keypoints.map((keypoint, idx) => (
              <li key={keypoint + idx}>
                <img
                  alt="Tick Icon"
                  src={tickIcon}
                  className={styles["tick-icon"]}
                />
                <p>{keypoint}</p>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            className={styles["btn-full"]}
            disabled={isPlanActive}
            onClick={openAuthModal}
          >
            {buttonText}
          </Button>
        </>
      )}
    </div>
  );
}

PricingCard.propTypes = {
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  tagline: PropTypes.string.isRequired,
  pricing: PropTypes.number.isRequired,
  keypoints: PropTypes.arrayOf(PropTypes.string).isRequired,
  activePlan: PropTypes.string,
  openAuthModal: PropTypes.func.isRequired,
};

export default PricingCard;
