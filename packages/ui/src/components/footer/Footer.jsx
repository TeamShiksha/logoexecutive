import { BRANDING, FOOTER_SECTIONS } from "../../utils/Constants";
import styles from "./Footer.module.css";
import { Link, useNavigate } from "react-router-dom";
import { handleNavigation } from "../../utils/Helpers";
import { Github } from "lucide-react";
import PropTypes from "prop-types";

const LUCIDE_LOGOS = {
  github: Github,
};

function FooterLogo({ logo, size = 18 }) {
  if (!logo) {
    return null;
  }

  if (logo.type === "lucide") {
    const Icon = LUCIDE_LOGOS[logo.iconName];
    return Icon ? <Icon size={size} color="currentColor" /> : null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={logo.viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" d={logo.path} />
    </svg>
  );
}

FooterLogo.propTypes = {
  logo: PropTypes.shape({
    type: PropTypes.string,
    iconName: PropTypes.string,
    viewBox: PropTypes.string,
    path: PropTypes.string,
  }),
  size: PropTypes.number,
};

function Footer() {
  const navigate = useNavigate();
  const socialLinks =
    FOOTER_SECTIONS.find(
      (section) => section.title === "Community"
    )?.items.filter((item) => item.logo) ?? [];

  return (
    <div data-testid="footer" className={styles.block}>
      <footer className={`container ${styles["footer-container"]}`}>
        <div className={styles["footer-top"]}>
          <div className={styles["footer-brand-section"]}>
            <button
              className={styles["footer-logo"]}
              data-testid="footer-logo-button"
              onClick={() => navigate("/")}
            >
              <img
                alt={BRANDING.imageAlt}
                src={BRANDING.imageSrc}
                width={30}
                height={30}
              />
              <h4>{BRANDING.brandName}</h4>
            </button>
            <p className={styles["footer-description"]}>
              The premium, open-source library for exceptionally crisp,
              developer-ready SVG brand logos. Free forever.
            </p>
          </div>
          <div className={styles["footer-links-wrapper"]}>
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className={styles["footer-section"]}>
                <h4 className={styles["footer-section-title"]}>
                  {section.title}
                </h4>
                <div className={styles["footer-items"]}>
                  {section.items.map((item) => {
                    const isExternal = item.url.startsWith("http");
                    return isExternal ? (
                      <a
                        key={item.name}
                        className={styles["footer-item"]}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        className={styles["footer-item"]}
                        to={item.url}
                        onClick={(event) =>
                          handleNavigation(event, item.url, navigate)
                        }
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles["footer-bottom"]}>
          <div className={styles["footer-copyright"]}>
            © {new Date().getFullYear()} {BRANDING.brandName}. All rights
            reserved.{" "}
            <a
              href={BRANDING.poweredByLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["footer-powered"]}
            >
              {BRANDING.poweredByText}
            </a>
            .
          </div>
          <div className={styles["footer-social"]}>
            {socialLinks.map((item) => {
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.title}
                >
                  <FooterLogo logo={item.logo} size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
