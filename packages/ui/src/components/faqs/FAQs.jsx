import { useState, useRef } from "react";
import { FAQ } from "../../utils/Constants";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";
import styles from "./FAQs.module.css";

const FAQs = () => {
  const [openQuestion, setOpenQuestion] = useState(null); // Track the open FAQ

  return (
    <div className={styles["faq-container"]}>
      <h1 className={styles.heading}>{FAQ.TITLE}</h1>
      <div className={styles["faq-list"]}>
        {FAQ["QAS"].map((faq) => (
          <CollapsibleFAQ
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
            isOpen={openQuestion === faq.question} // Pass isOpen state
            toggleFAQ={() =>
              setOpenQuestion(
                openQuestion === faq.question ? null : faq.question
              )
            } // Toggle open/close
          />
        ))}
      </div>
    </div>
  );
};

const CollapsibleFAQ = ({ question, answer, isOpen, toggleFAQ }) => {
  const answerRef = useRef(null);

  return (
    <div className={`${styles["faq-item"]} ${isOpen ? styles.open : ""}`}>
      <button className={styles["qa-container"]} onClick={toggleFAQ}>
        <h3 className={styles.question}>{question}</h3>
        <ChevronDown
          className={`${styles.icon} ${isOpen ? styles.rotated : ""}`}
          size={20}
        />
      </button>
      <div
        id={`faq-answer-${question}`}
        className={`${styles["answer-container"]} ${isOpen ? styles.open : ""}`}
        ref={answerRef}
        style={{
          maxHeight: isOpen ? `${answerRef.current?.scrollHeight}px` : "0px",
        }}
      >
        <p className={styles.answer}>{answer}</p>
      </div>
    </div>
  );
};

CollapsibleFAQ.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleFAQ: PropTypes.func.isRequired,
};

export default FAQs;
