import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import styles from "./NotFound.module.css";
import { NOT_FOUND_PAGE } from "../../utils/Constants";

const NotFound = () => {
  return (
    <div className={styles["not-found-container"]}>
      <img
        src="/404_illustration.png"
        alt="404 Illustration"
        className={styles["not-found-image"]}
      />
      <h1 className={styles["not-found-title"]}>{NOT_FOUND_PAGE.TITLE}</h1>
      <p className={styles["not-found-message"]}>{NOT_FOUND_PAGE.MESSAGE}</p>
      <Link
        to="/"
        className={`btn-link btn-link-primary ${styles["action-button"]}`}
      >
        <Home size={18} />
        <span>Go back home</span>
      </Link>
    </div>
  );
};

export default NotFound;
