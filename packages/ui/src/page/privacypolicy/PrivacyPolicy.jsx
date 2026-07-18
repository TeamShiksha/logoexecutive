import styles from "./PrivacyPolicy.module.css";
import { PRIVACY_AND_TERMS } from "../../utils/Constants";

const PrivacyPolicy = () => {
  return (
    <div className={`container ${styles["privacy-page-container"]}`}>
      {PRIVACY_AND_TERMS.map((section) => (
        <section key={section.DATA_ID} className={styles.section}>
          <h2
            className={styles.heading}
            data-testid={section.DATA_ID}
            id={section.DATA_ID}
          >
            {section.HEADLINE}
          </h2>

          {section.TEXTS.map((paragraph, index) => (
            <p className={styles.text} key={index}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
};

export default PrivacyPolicy;
