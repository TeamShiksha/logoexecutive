import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MobileHeaderMenu from "./MobileHeaderMenu";
import Button from "../common/button/Button";
import UserDropDown from "../dropdown/UserDropDown";
import {
  HEADER_ITEMS,
  HAMBURGER,
  CROSS,
  BUTTON_TEXT,
  BRANDING,
  LOGGEDIN_ITEMS,
} from "../../utils/Constants";
import styles from "./Header.module.css";
import {
  handleNavigation,
  observeActiveSectionOnScroll,
  extractSectionIds,
} from "../../utils/Helpers";
import { AuthContext } from "../../contexts/Contexts";
import { DarkModeToggle } from "../darkModeToggle/DarkModeToggle.jsx";

const Header = ({ openAuthModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const currentPath = location.pathname;
  const [showMenu, setShowMenu] = useState(false);
  const menuIcon = showMenu ? CROSS : HAMBURGER;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const NAVBAR_ITEMS = isAuthenticated ? LOGGEDIN_ITEMS : HEADER_ITEMS;
  const sectionIds = extractSectionIds(NAVBAR_ITEMS);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    // Call once initially
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const cleanup = observeActiveSectionOnScroll(sectionIds, setActiveSection);
    return cleanup;
  }, [sectionIds]);

  return (
    <div
      data-testid="header"
      className={`${styles.block} ${isScrolled ? styles.scrolled : ""}`}
    >
      <header className={`container ${styles.header}`}>
        {/* Brand */}
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate("/")}
        >
          <img
            className={`${styles["brand-img"]} ${styles["light-logo"]}`}
            alt={BRANDING.brandName}
            src={BRANDING.imageSrc}
          />
          <img
            className={`${styles["brand-img"]} ${styles["dark-logo"]}`}
            alt={BRANDING.brandName}
            src={BRANDING.imageSrcDark || BRANDING.imageSrc}
          />
          <span className={styles["brand-name"]}>{BRANDING.brandName}</span>
        </button>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav className={styles["nav-bar"]}>
            {NAVBAR_ITEMS.map((item) => {
              const [itemPath, itemSection] = item.url.split("#");
              const isActive =
                item.type === "route"
                  ? currentPath === item.url
                  : currentPath === itemPath && activeSection === itemSection;

              return (
                <Link
                  key={item.name}
                  className={`${styles.nav} ${isActive ? styles.active : ""}`}
                  to={item.url}
                  onClick={(e) =>
                    handleNavigation(e, item.url, navigate, setActiveSection)
                  }
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div className={styles["right-side"]}>
          <DarkModeToggle />
          {isAuthenticated ? (
            <UserDropDown />
          ) : (
            <div className={styles.headerBtnWrapper}>
              <Button variant="primary" onClick={openAuthModal}>
                {BUTTON_TEXT.getStarted}
              </Button>
            </div>
          )}
          {isMobile && (
            <button
              className={styles.hamburger}
              onClick={() => setShowMenu((p) => !p)}
            >
              <img
                className={styles["hamburger-img"]}
                src={menuIcon.src}
                alt={menuIcon.alt}
              />
            </button>
          )}
        </div>
      </header>

      <MobileHeaderMenu isOpen={showMenu} closeMenu={setShowMenu} />
    </div>
  );
};

Header.propTypes = {
  openAuthModal: PropTypes.func.isRequired,
};

export default Header;
