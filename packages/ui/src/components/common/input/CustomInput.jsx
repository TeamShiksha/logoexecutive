import PropTypes from "prop-types";
import styles from "./CustomInput.module.css";

function CustomInput({
  type,
  name,
  label,
  value,
  error,
  onChange = () => {},
  className = "",
  disabled = false,
  onFocus = () => {},
  onBlur = () => {},
  ...rest
}) {
  const isFocused = false;

  return (
    <div className={`${styles.group} ${className}`}>
      <input
        type={type}
        id={label}
        name={name}
        className={styles["group-input"]}
        disabled={disabled}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        {...rest}
      />
      <label
        className={`${styles["input-label"]} ${
          isFocused || value ? styles["label-active"] : ""
        }`}
        htmlFor={label}
      >
        {label}
      </label>
      <div className={`error-container ${error ? "has-error" : ""}`}>
        <p className="input-error">{error}</p>
      </div>
    </div>
  );
}

CustomInput.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  error: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
};

export default CustomInput;
