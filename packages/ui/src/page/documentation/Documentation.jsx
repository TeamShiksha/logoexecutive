import { useState } from "react";
import Table from "../../components/common/table/Table.jsx";
import { DOCUMENTATION } from "../../utils/Constants";
import styles from "./Documentation.module.css";
import CodeBlock from "./CodeBlock.jsx";
import ContactForm from "../../components/contact/ContactForm.jsx";
import { getBaseApiUrl } from "../../utils/Helpers.js";

const RESPONSE_EXAMPLES = {
  "Logo Retrieval": `{
  "statusCode": 200,
  "data": "https://assets.openlogo.dev/png/google.com.png"
}`,
  "Search Logos": `{
  "statusCode": 200,
  "data": [
    {
      "companyName": "google",
      "image": "https://assets.openlogo.dev/png/google.com.png"
    },
    {
      "companyName": "godaddy",
      "image": "https://assets.openlogo.dev/png/godaddy.com.png"
    }
  ]
}`,
};

const Documentation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentDomain =
    typeof window !== "undefined" ? window.location.origin : "";
  const baseAPI = getBaseApiUrl(currentDomain);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [selectedLanguages, setSelectedLanguages] = useState({});

  const getSelectedLanguage = (featureHeading) =>
    selectedLanguages[featureHeading] || "javascript";

  const handleLanguageChange = (featureHeading, language) => {
    setSelectedLanguages((prev) => ({
      ...prev,
      [featureHeading]: language,
    }));
  };

  return (
    <section className={`container ${styles.documentationShell}`}>
      <div className={styles.docsLayout}>
        <main className={styles.contentColumn}>
          <section className={styles.introPanel}>
            <h1 className={styles.heroHeading}>
              {DOCUMENTATION.introduction.heading}
            </h1>
            <p className={styles.text}>{DOCUMENTATION.introduction.text}</p>
            <p className={styles.baseInfo}>{baseAPI}</p>
            <p className={styles.noticeBanner}>
              <strong>New:</strong> We&apos;ve recently updated our search
              algorithms to support semantic search. Find logos by industry or
              color palette.
            </p>
          </section>

          {DOCUMENTATION.apiDocs.map((feature) => {
            return (
              <article key={feature.heading} className={styles.apiCard}>
                <div className={styles.apiTitleWrap}>
                  <span className={styles.methodBadge}>GET</span>
                  <h2 className={styles.cardHeading}>{feature.heading}</h2>
                </div>
                <p className={styles.text}>{feature.text}</p>
                <p className={styles.endpointText}>{feature.endPoint}</p>

                <CodeBlock
                  id={feature.heading}
                  codeExamples={
                    typeof feature.codeExample === "function"
                      ? feature.codeExample(baseAPI.replace("Base URL: ", ""))
                      : feature.codeExample
                  }
                  selectedLanguage={getSelectedLanguage(feature.heading)}
                  setSelectedLanguage={(language) =>
                    handleLanguageChange(feature.heading, language)
                  }
                />

                <h3 className={styles.subHeading}>Parameters</h3>
                <div className={styles.tableWrapper}>
                  <Table
                    headers={DOCUMENTATION.tableDataHeaders}
                    rows={feature.tableDataContent}
                    emptyMessage="No data available"
                    isGuest={false}
                  />
                </div>

                <h3 className={styles.subHeading}>Response</h3>
                <div className={styles.responseShell}>
                  <p className={styles.responseMeta}>JSON RESPONSE</p>
                  <pre className={styles.responseBlock}>
                    <code>
                      {RESPONSE_EXAMPLES[feature.heading] ||
                        RESPONSE_EXAMPLES["Logo Retrieval"]}
                    </code>
                  </pre>
                </div>
              </article>
            );
          })}

          <div className={styles.supportCard}>
            <p className={styles.text}>
              {DOCUMENTATION.customerSupportText[0]}
              <button
                type="button"
                className={styles.linkButton}
                onClick={openModal}
              >
                contact us
              </button>
              {DOCUMENTATION.customerSupportText[1]}
            </p>
          </div>
        </main>
      </div>

      {isModalOpen && <ContactForm closeModal={closeModal} />}
    </section>
  );
};

export default Documentation;
