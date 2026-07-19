import { useEffect, useState, useMemo } from "react";
import { ThemeContext } from "./Contexts.jsx";
import PropTypes from "prop-types";

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null && saved !== undefined) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to parse darkMode from localStorage:", error);
    }
    return globalThis.matchMedia
      ? globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) {
      favicon.href = isDarkMode ? "/openlogo-white.svg" : "/openlogo.svg";
    }

    if (isDarkMode) {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const contextValue = useMemo(
    () => ({ isDarkMode, toggleTheme }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
