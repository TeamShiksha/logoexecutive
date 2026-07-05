import { FEATURES } from "../../utils/Constants";
import styles from "./Features.module.css";

function Features() {
  return (
    <section
      data-testid="features"
      id="features"
      className={styles["features-container"]}
    >
      <div className={styles.head}>
        <h2>{FEATURES.heading}</h2>
        <p>{FEATURES.summary}</p>
      </div>
      <div className={styles["features-list"]}>
        {FEATURES.items.map((FEATURE_ITEM, index) => (
          <div className={styles["features-list-item"]} key={index}>
            <div className={styles["icon-wrapper"]}>
              <img src={FEATURE_ITEM.icon} alt="logo" />
            </div>
            <h3>{FEATURE_ITEM.title}</h3>
            <p>{FEATURE_ITEM.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
