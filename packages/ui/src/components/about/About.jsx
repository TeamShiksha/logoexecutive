import { ABOUT } from "../../utils/Constants";
import styles from "./About.module.css";

const About = () => {
  return (
    <section data-testid="about" id="about" className={styles["about-section"]}>
      <div className={`container ${styles["about-inner"]}`}>
        <div className={styles["section-header"]}>
          <h2 className={styles.title}>{ABOUT.TITLE}</h2>
          <p className={styles.description}>{ABOUT.DESCRIPTION}</p>
        </div>

        <div className={styles["marquee-wrapper"]}>
          <div className={styles["marquee-fade-left"]} />
          <div className={styles["marquee-fade-right"]} />
          <div className={styles["marquee-track"]}>
            {[...ABOUT.INTEGRATIONS, ...ABOUT.INTEGRATIONS].map(
              (integration, index) => (
                <div
                  key={`${integration.id}-${index}`}
                  className={styles["logo-card"]}
                >
                  <img src={integration.src} alt={integration.alt} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
