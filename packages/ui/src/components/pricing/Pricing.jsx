import PropTypes from "prop-types";
import PricingCard from "./PricingCard";
import { PRICING } from "../../utils/Constants";
import styles from "./Pricing.module.css";

function Pricing({ openAuthModal, activePlan }) {
  return (
    <div
      data-testid="pricing"
      id="pricing"
      className={styles["pricing-container"]}
    >
      <h1 className={styles.heading}>{PRICING.heading}</h1>
      <p className={styles["tag-line"]}>{PRICING.summary}</p>
      <div className={styles.plan}>
        {PRICING["plans"].map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            tagline={plan.tagline}
            index={plan.index}
            pricing={plan.pricing}
            keypoints={plan.keypoints}
            openAuthModal={openAuthModal}
            activePlan={activePlan}
          />
        ))}
      </div>
    </div>
  );
}

Pricing.propTypes = {
  openAuthModal: PropTypes.func.isRequired,
  activePlan: PropTypes.string,
};

export default Pricing;
