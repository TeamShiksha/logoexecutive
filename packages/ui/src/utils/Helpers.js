import {
  DOCUMENTATION,
  CHANGE_PASSWORD,
  PASSWORD_VALIDATION_MESSAGES,
} from "./Constants";
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 20,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresDigit: true,
  requiresSpecialChar: true,
  specialCharRegex: /[!@#$%^&*(),.?":{}|<>]/,
};

export const isValidPassword = (password) => {
  const errors = {};

  if (!password) {
    errors.password = PASSWORD_VALIDATION_MESSAGES.required;
  } else {
    const checks = [
      {
        condition: password.length < PASSWORD_RULES.minLength,
        message: PASSWORD_VALIDATION_MESSAGES.minLength(
          PASSWORD_RULES.minLength
        ),
      },
      {
        condition: password.length > PASSWORD_RULES.maxLength,
        message: PASSWORD_VALIDATION_MESSAGES.maxLength(
          PASSWORD_RULES.maxLength
        ),
      },
      {
        condition: PASSWORD_RULES.requiresUppercase && !/[A-Z]/.test(password),
        message: PASSWORD_VALIDATION_MESSAGES.uppercase,
      },
      {
        condition: PASSWORD_RULES.requiresLowercase && !/[a-z]/.test(password),
        message: PASSWORD_VALIDATION_MESSAGES.lowercase,
      },
      {
        condition: PASSWORD_RULES.requiresDigit && !/\d/.test(password),
        message: PASSWORD_VALIDATION_MESSAGES.digit,
      },
      {
        condition:
          PASSWORD_RULES.requiresSpecialChar &&
          !PASSWORD_RULES.specialCharRegex.test(password),
        message: PASSWORD_VALIDATION_MESSAGES.specialChar,
      },
    ];

    checks.forEach(({ condition, message }) => {
      if (condition) {
        errors.password = message;
      }
    });
  }

  return Object.keys(errors).length === 0 ? {} : errors;
};

export const getPasswordCriteria = (password) => [
  {
    label: `${PASSWORD_RULES.minLength}+ characters`,
    met: password.length >= PASSWORD_RULES.minLength,
  },
  {
    label: "Uppercase",
    met: !PASSWORD_RULES.requiresUppercase || /[A-Z]/.test(password),
  },
  {
    label: "Lowercase",
    met: !PASSWORD_RULES.requiresLowercase || /[a-z]/.test(password),
  },
  {
    label: "Number (0-9)",
    met: !PASSWORD_RULES.requiresDigit || /\d/.test(password),
  },
  {
    label: "Special character",
    met:
      !PASSWORD_RULES.requiresSpecialChar ||
      PASSWORD_RULES.specialCharRegex.test(password),
  },
];

export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  const urlRegex =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  return urlRegex.test(url);
};

export const isSQLInjectionAttempt = (message) => {
  const sqlInjectionRegex = /(')|(--)|(\/\*)|(\bSELECT\b)|\bunion\b/i;
  return sqlInjectionRegex.test(message);
};

export const isValidMessage = (message) => {
  const messageRegex = /^[^!@#$%^&*(){}[\];'"<>/`~|0-9]*$/;
  return messageRegex.test(message);
};

export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s]*$/;
  return nameRegex.test(name);
};

export const isValidDescription = (description) => {
  const descriptionRegex = /^[a-zA-Z\s]*$/;
  return descriptionRegex.test(description);
};

export const formatDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const extractSectionIds = (navItems) => {
  return navItems
    .filter((item) => item.type === "section")
    .map((item) => item.url.split("#")[1] || "");
};

export const observeActiveSectionOnScroll = (sectionIds, setActiveSection) => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    let found = false;

    for (let id of sectionIds) {
      const section = document.getElementById(id);
      if (section) {
        const { offsetTop, offsetHeight } = section;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(id);
          found = true;
          break;
        }
      }
    }

    if (!found && window.scrollY === 0) {
      setActiveSection("");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  return () => window.removeEventListener("scroll", handleScroll);
};

export const handleNavigation = (event, url, navigate, setActiveSection) => {
  event.preventDefault();

  const [path, sectionId] = url.split("#");
  if (typeof setActiveSection === "function") {
    setActiveSection(sectionId);
  }
  if (window.location.pathname !== path) {
    if (sectionId) {
      sessionStorage.setItem("scrollTo", sectionId);
    }
    navigate(path);
  } else if (sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 95;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - offset,
        behavior: "smooth",
      });
    }
  } else {
    window.scrollTo(0, 0);
  }
};

export const validate = (values) => {
  const errors = {};

  const validateField = (field, condition, errorMessage) => {
    if (field in values && condition) {
      errors[field] = errorMessage;
    }
  };

  validateField("name", !values.name, "Name is required");
  validateField(
    "name",
    values.name && !isValidName(values.name),
    "Only letters and spaces allowed"
  );

  validateField("description", !values.description, "Description is required");
  validateField(
    "description",
    values.description && !isValidDescription(values.description),
    "Only letters and spaces allowed"
  );

  validateField("email", !values.email, "Email is required");
  validateField(
    "email",
    values.email && !isValidEmail(values.email),
    "This is not a valid email format"
  );

  if ("password" in values) {
    const passwordErrors = isValidPassword(values.password);
    if (Object.keys(passwordErrors).length > 0) {
      errors.password = passwordErrors.password;
    }
  }
  validateField(
    "confirmPassword",
    !values.confirmPassword,
    "Confirm password is required"
  );
  validateField(
    "confirmPassword",
    values.confirmPassword && values.confirmPassword !== values.password,
    "Passwords do not match"
  );
  validateField("message", !values.message, "Message is required");
  validateField(
    "message",
    values.message && !isValidMessage(values.message),
    "Only letters, spaces and punctuation marks (.?,) allowed"
  );
  validateField(
    "message",
    values.message && values.message.length < 20,
    "Message should be at least 20 characters"
  );
  validateField(
    "message",
    values.message && values.message.length > 100,
    "Message should be less than 100 characters"
  );
  validateField("companyUrl", !values.companyUrl, "Company Url is required");
  validateField(
    "companyUrl",
    values.companyUrl && !isValidUrl(values.companyUrl),
    "This is not a valid url"
  );
  validateField(
    "companyDescription",
    !values.companyDescription,
    "Company Description is required"
  );
  validateField(
    "companyDescription",
    values.companyDescription && values.companyDescription.length < 20,
    "Description should be at least 20 characters"
  );
  return errors;
};

export const validateChangePassword = (values) => {
  const errors = {};
  if (!values.currPassword) {
    errors.currPassword = CHANGE_PASSWORD.currRequired;
  } else {
    const currPasswordErrors = isValidPassword(values.currPassword);
    if (currPasswordErrors?.password) {
      errors.currPassword = currPasswordErrors.password;
    }
  }
  if (!values.newPassword) {
    errors.newPassword = CHANGE_PASSWORD.newRequired;
  } else {
    const newPasswordErrors = isValidPassword(values.newPassword);
    if (newPasswordErrors?.password) {
      errors.newPassword = newPasswordErrors.password;
    }
  }
  if (
    values.currPassword?.trim() &&
    values.newPassword?.trim() &&
    !errors.currPassword &&
    !errors.newPassword &&
    values.currPassword === values.newPassword
  ) {
    errors.newPassword = CHANGE_PASSWORD.samePassword;
  }
  return errors;
};

/**
 * Returns the base API URL based on the provided domain.
 *
 * @param {string} domain - The domain to check against.
 * @returns {string} - The base API URL corresponding to the domain.
 * If the domain includes "localhost", it returns the local URL.
 * If the domain includes "stage", it returns the staging URL.
 * Otherwise, it returns the production URL.
 */
export const getBaseApiUrl = (domain) => {
  if (domain.includes("localhost")) {
    return DOCUMENTATION.localUrl;
  } else if (domain.includes("stage")) {
    return DOCUMENTATION.baseStageUrl;
  } else {
    return DOCUMENTATION.baseProdUrl;
  }
};

export const firstLetterCapitalString = (string) => {
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
};
export const processWebImage = async (
  url,
  companyName,
  bufferBase64,
  extension
) => {
  const name = companyName ? companyName.toLowerCase() : "image";
  return new Promise((resolve, reject) => {
    let mimeType = "image/png";
    if (extension === "svg" || extension === "image/svg+xml") {
      mimeType = "image/svg+xml";
    } else if (extension === "jpg" || extension === "jpeg") {
      mimeType = "image/jpeg";
    }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img_element = new Image();
    img_element.crossOrigin = "Anonymous";
    img_element.onload = () => {
      let renderWidth = img_element.naturalWidth || img_element.width;
      let renderHeight = img_element.naturalHeight || img_element.height;
      if (!renderWidth || !renderHeight) {
        try {
          const svgStr = atob(bufferBase64);
          const viewBoxMatch = svgStr.match(
            /viewBox=["']\d+ \d+ (\d+) (\d+)["']/
          );
          if (viewBoxMatch) {
            renderWidth = Number.parseInt(viewBoxMatch[1], 10);
            renderHeight = Number.parseInt(viewBoxMatch[2], 10);
          } else {
            renderWidth = 500;
            renderHeight = 500;
          }
        } catch (e) {
          console.error("SVG parsing failed", e);
        }
      }
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      ctx.clearRect(0, 0, renderWidth, renderHeight);
      ctx.drawImage(img_element, 0, 0, renderWidth, renderHeight);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return reject(new Error("PNG conversion failed"));

        const pngFile = new File([pngBlob], `${name}.png`, {
          type: "image/png",
        });
        resolve(pngFile);
      }, "image/png");
    };

    img_element.onerror = (e) => {
      console.error("Image load error:", e);
      reject(new Error("Image load failed"));
    };
    img_element.src = `data:${mimeType};base64,${bufferBase64}`;
  });
};
