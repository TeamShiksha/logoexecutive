import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";
import PropTypes from "prop-types";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

/**
 * Configuration for different toast types
 */
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    title: "Success",
  },
  warning: {
    icon: AlertTriangle,
    title: "Warning",
  },
  error: {
    icon: AlertCircle,
    title: "Error",
  },
  info: {
    icon: Info,
    title: "Information",
  },
};

const Toast = ({ message, type = "info", duration = 5000, onClose, id }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef(null);
  const timerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    clearTimers();

    setTimeout(() => {
      if (onClose) {
        onClose(id);
      }
    }, 300); // Wait for slide-out animation
  }, [onClose, id, clearTimers]);

  const startTimer = useCallback(
    (timeToWait) => {
      const intervalTime = 10;
      const steps = duration / intervalTime;
      const decrementPerStep = 100 / steps;

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.max(prev - decrementPerStep, 0));
      }, intervalTime);

      timerRef.current = setTimeout(handleClose, timeToWait);
    },
    [duration, handleClose]
  );

  useEffect(() => {
    startTimer(duration);
    return clearTimers;
  }, [duration, startTimer, clearTimers]);

  const handleMouseEnter = () => {
    clearTimers();
  };

  const handleMouseLeave = () => {
    const remainingTime = (progress / 100) * duration;
    if (remainingTime > 0) {
      startTimer(remainingTime);
    } else {
      handleClose();
    }
  };

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const toastClassName = `${styles.toast} ${styles[type]} ${isExiting ? styles.exiting : ""}`;

  return (
    <div
      className={toastClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className={styles.iconContainer}>
        <Icon size={18} className={styles.iconElement} />
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>{config.title}</h4>
        <p className={styles.message}>{message}</p>
      </div>

      <button
        className={styles["close-button"]}
        onClick={handleClose}
        aria-label="Close notification"
      >
        <X size={20} />
      </button>

      <div
        className={styles["progress-bar"]}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Toast;
