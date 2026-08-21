import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck, Copy, Check, Search } from "lucide-react";
import { BUTTON_TEXT, DEMO, TILTED_BRANDS } from "../../utils/Constants.js";
import styles from "./Demo.module.css";
import Button from "../common/button/Button.jsx";
import PropTypes from "prop-types";
import {
  firstLetterCapitalString,
  getBaseApiUrl,
  getLogoDomain,
} from "../../utils/Helpers.js";
import { useApi } from "../../hooks/useApi.js";
import LogoRequestForm from "./LogoRequestForm.jsx";
import { AuthContext } from "../../contexts/Contexts.jsx";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner.jsx";

const Demo = ({ openAuthModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [copiedCompany, setCopiedCompany] = useState(null);
  const { makeRequest, data, loading, errorMsg } = useApi({
    method: "GET",
    url: "/logo/demo-search",
    params: {
      key: searchTerm,
    },
  });
  const showResults = searchTerm.length > 1;
  const apiResults = useMemo(() => {
    if (errorMsg || !data?.data || !showResults) {
      return [];
    }
    const cleanSearchTerm = searchTerm
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .split(".")[0]
      .toLowerCase();

    if (!cleanSearchTerm) {
      return [];
    }

    return data.data
      .filter(({ companyName }) =>
        companyName.toLowerCase().includes(cleanSearchTerm)
      )
      .slice(0, 3);
  }, [errorMsg, data, showResults, searchTerm]);
  const { isAuthenticated } = useContext(AuthContext);
  const baseApiUrl = useMemo(
    () =>
      getBaseApiUrl(
        typeof window !== "undefined" ? window.location.origin : ""
      ).replace("Base URL: ", ""),
    []
  );

  const buildLogoUrl = ({ image, companyName }) =>
    `${baseApiUrl}/logo?key=${getLogoDomain(image, companyName)}&API_KEY=YOUR_API_KEY`;

  const handleCopyLink = (company) => {
    navigator.clipboard.writeText(buildLogoUrl(company)).then(() => {
      setCopiedCompany(company.companyName);
      setTimeout(() => setCopiedCompany(null), 2000);
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length > 1) {
        makeRequest();
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleInputChange = (inputChangeEvent) => {
    const value = inputChangeEvent.target.value;
    setSearchTerm(value);
  };

  const openModal = () => setIsRequestModalOpen(true);
  const closeModal = () => setIsRequestModalOpen(false);

  const navigate = useNavigate();

  const handleRequestClick = () => {
    if (isAuthenticated) {
      openModal();
    } else {
      openAuthModal();
    }
  };

  return (
    <>
      <div data-testid="demo" id="demo" className={styles["demo-wrapper"]}>
        <div className="container">
          <div className={styles["demo-container"]}>
            {/* Search Area Box */}
            <div className={styles.searchBox}>
              <div className={styles.searchContent}>
                {/* Redesigned Search Form */}
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className={styles.searchForm}
                >
                  <Search className={styles.searchIcon} size={20} />
                  <input
                    name="search"
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    className={styles.searchInput}
                    placeholder="Type a brand name or URL to search"
                  />
                </form>

                {/* RESULT CARD OR DECK */}
                {showResults ? (
                  <div className={styles.resultContainer}>
                    {loading && (
                      <div className={styles.loading}>
                        <LoadingSpinner color="blue" />
                      </div>
                    )}

                    {!loading && apiResults.length === 0 ? (
                      <div className={styles.noResult}>
                        <p>
                          {"Your search “"}
                          <b className={styles.searchTerm}>{searchTerm}</b>
                          {"” did not match any logo."}
                        </p>

                        <div className={styles.noResultButtons}>
                          <Button
                            onClick={handleRequestClick}
                            variant="primary"
                          >
                            {BUTTON_TEXT.requestLogo}
                          </Button>
                          <Button
                            onClick={() => navigate("/createlogo")}
                            variant="primary"
                          >
                            {BUTTON_TEXT.createLogo}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {apiResults.map((company) => (
                          <div
                            key={company.companyName}
                            className={styles.resultCard}
                          >
                            <div className={styles.resultHeader}>
                              <img src={company.image} alt="logo" />
                              <div className={styles.brandInfo}>
                                <h3>
                                  {firstLetterCapitalString(
                                    company.companyName
                                  )}
                                </h3>
                                {company.extension && (
                                  <span className={styles.formatBadge}>
                                    {company.extension.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(company)}
                                className={`${styles.copyBtn} ${
                                  copiedCompany === company.companyName
                                    ? styles.copyBtnCopied
                                    : ""
                                }`}
                              >
                                {copiedCompany === company.companyName ? (
                                  <>
                                    <Check size={16} />
                                    {BUTTON_TEXT.copied}
                                  </>
                                ) : (
                                  <>
                                    <Copy size={16} />
                                    {BUTTON_TEXT.copyLink}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  /* Redesigned Tilted Cards Deck shown when empty */
                  <div className={styles.deckSection}>
                    <div className={styles.deckContainer}>
                      {TILTED_BRANDS.map((brand) => (
                        <button
                          key={brand.name}
                          type="button"
                          className={`${styles.deckCard} ${brand.featured ? styles.featuredCard : ""}`}
                          style={{
                            backgroundColor: brand.bgColor,
                            color: brand.textColor,
                            transform: `rotate(${brand.tilt}) translateY(${brand.nudge})`,
                          }}
                          onClick={() =>
                            setSearchTerm(brand.name.toLowerCase())
                          }
                        >
                          <div className={styles.cardLogoWrapper}>
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className={styles.cardLogo}
                            />
                          </div>
                          <span className={styles.cardName}>{brand.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h1>
                Try it yourself.
                <br />
                Instant logo retrieval.
              </h1>
              <p>{DEMO.summary}</p>

              <ul className={styles.features}>
                {DEMO.features.map((item) => (
                  <li key={item} className={styles.feature}>
                    <CircleCheck className={styles["features-icon"]} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {isRequestModalOpen && <LogoRequestForm closeModal={closeModal} />}
    </>
  );
};

Demo.propTypes = {
  openAuthModal: PropTypes.func.isRequired,
};

export default Demo;
