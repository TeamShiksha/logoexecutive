import styles from "./Pin.module.css";
import { useState, useRef, useContext } from "react";
import Button from "../common/button/Button";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast.js";
import { AuthContext } from "../../contexts/Contexts";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
const PIN_INPUTS = [
  { id: "p1", index: 0 },
  { id: "p2", index: 1 },
  { id: "p3", index: 2 },
  { id: "p4", index: 3 },
  { id: "p5", index: 4 },
  { id: "p6", index: 5 },
];

function Pin({ onClose }) {
  const [pin, setPin] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);
  const toast = useToast();
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const { fetchRequest } = useApi({
    method: "post",
    url: `/auth/mfa/signin`,
  });

  const handleSubmit = async () => {
    const { success, error } = await fetchRequest({
      data: {
        token: pin.join(""),
      },
    });
    if (success) {
      setPin(new Array(6).fill(""));
      setIsAuthenticated(true);
      navigate("/dashboard");
      onClose();
      toast.success("Pin verified");
    } else {
      toast.error(error);
    }
  };
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // move focus forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  return (
    <div className={styles["pin-wrapper"]}>
      <div className={styles["pin-container"]}>
        {PIN_INPUTS.map((input) => (
          <input
            key={input.id}
            ref={(el) => (inputsRef.current[input.index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className={styles["pin-input"]}
            value={pin[input.index]}
            onChange={(e) => handleChange(e.target.value, input.index)}
            onKeyDown={(e) => handleKeyDown(e, input.index)}
          />
        ))}
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={pin.some((digit) => !digit)}
        onClick={handleSubmit}
      >
        Verify
      </Button>
    </div>
  );
}

Pin.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Pin;
