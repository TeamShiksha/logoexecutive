import { useState } from "react";
import PropTypes from "prop-types";
import { CODEBLOCK } from "../../utils/Constants";
import styles from "./Documentation.module.css";

const CodeBlock = ({
  id,
  codeExamples,
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const [copyMessage, setCopyMessage] = useState("");

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(""), 2000);
    });
  };

  const languageLabelMap = {
    curl: "cURL",
    javascript: "JavaScript",
    python: "Python",
    java: "Java",
  };

  const selectedCode = codeExamples[selectedLanguage] || "";
  const codeLines = selectedCode.split("\n");

  return (
    <div className={styles["code-block-wrapper"]}>
      <div className={styles["code-block-header"]}>
        <div className={styles["code-window-dots"]}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={styles["code-header-actions"]}>
          <div className={styles["language-selector"]}>
            {Object.keys(codeExamples).map((lang) => (
              <button
                type="button"
                key={`${id}-${lang}`}
                aria-label={`${lang} logo`}
                onClick={() => setSelectedLanguage(lang)}
                className={`${styles["language-button"]} ${
                  selectedLanguage === lang
                    ? styles["language-button-active"]
                    : ""
                }`}
              >
                <span className={styles["language-label"]}>
                  {languageLabelMap[lang] || lang}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles["copy-button"]}
            onClick={() => copyToClipboard(selectedCode)}
          >
            <img
              src={copyMessage ? CODEBLOCK.tick : CODEBLOCK.copycodeicon}
              alt="tick-copy-code"
              style={copyMessage ? {} : { cursor: "pointer" }}
            />
            <span className={styles["copy-label"]}>
              {copyMessage || "Copy"}
            </span>
          </button>
        </div>
      </div>

      <pre className={styles["code-block"]}>
        <code>
          {codeLines.map((line, index) => (
            <span
              key={`${id}-${selectedLanguage}-${index}`}
              className={styles["code-line"]}
            >
              <span className={styles["line-number"]}>{index + 1}</span>
              <span className={styles["line-content"]}>{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

CodeBlock.propTypes = {
  id: PropTypes.string.isRequired,
  codeExamples: PropTypes.objectOf(PropTypes.string).isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  setSelectedLanguage: PropTypes.func.isRequired,
};

export default CodeBlock;
