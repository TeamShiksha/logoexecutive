import { BUTTON_TEXT, CURRENT_PLAN } from "../../utils/Constants";
import styles from "./CurrentPlan.module.css";
import PropTypes from "prop-types";
import Button from "../common/button/Button";

function CurrentPlan({ isGuest }) {
  const keepBtnDisabled = true;
  return (
    <div className={styles["plan-container"]}>
      <div className={styles["plan-content"]}>
        <h3 className={styles["plan-name"]}>{CURRENT_PLAN.plan}</h3>
        <p className={styles["plan-tagline"]}>{CURRENT_PLAN.tagline}</p>
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
};

export default CurrentPlan;
