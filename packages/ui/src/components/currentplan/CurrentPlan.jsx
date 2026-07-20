import { BUTTON_TEXT, PLAN_DETAILS, DEFAULT_PLAN } from "../../utils/Constants";
import styles from "./CurrentPlan.module.css";
import PropTypes from "prop-types";
import Button from "../common/button/Button";

function CurrentPlan({ isGuest, subscription }) {
  const keepBtnDisabled = true;
  const planType = subscription?.type;
  const { plan, tagline } = PLAN_DETAILS[planType] ?? DEFAULT_PLAN;
  return (
    <div className={styles["plan-container"]}>
      <div className={styles["plan-content"]}>
        <h3
          className={`${styles["plan-name"]} ${planType === "PRO" ? styles["plan-name-pro"] : ""}`}
        >
          {plan}
        </h3>
        <p className={styles["plan-tagline"]}>{tagline}</p>
      </div>

      <Button
        variant="primary"
        className={styles["upgrade-button"]}
        disabled={keepBtnDisabled || isGuest}
        style={{ cursor: isGuest ? "default" : "pointer" }}
      >
        {BUTTON_TEXT.upgrade}
      </Button>
    </div>
  );
}

CurrentPlan.propTypes = {
  isGuest: PropTypes.bool.isRequired,
  subscription: PropTypes.shape({ type: PropTypes.string }),
};

export default CurrentPlan;
