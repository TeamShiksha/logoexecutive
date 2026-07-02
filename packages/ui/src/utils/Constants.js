import searchIcon from "../assets/searchIcon.svg";
import curvedArrow from "../assets/curvedArrow.svg";
import rapidLogo from "../assets/rapid.svg";
import searchLogo from "../assets/search.svg";
import databaseLogo from "../assets/database.svg";
import dragAndDropBg from "../assets/DragAndDropBg.svg";
import microsoft from "../assets/microsoft.png";
import target from "../assets/target.png";
import ford from "../assets/ford.png";
import adobe from "../assets/adobe.png";
import ibm from "../assets/ibm.png";
import alphabet from "../assets/alphabet.png";
import tesla from "../assets/tesla.png";
import walmart from "../assets/walmart.png";
import salesforce from "../assets/salesforce.png";
import airbnb from "../assets/airbnb.png";
import bmw from "../assets/bmw.png";
import byd from "../assets/byd.png";
import google from "../assets/google.png";
import sap from "../assets/sap.png";
import slack from "../assets/slack.png";
import spotify from "../assets/spotify.png";
import jsLogo from "../assets/js.png";
import pythonLogo from "../assets/python.png";
import javaLogo from "../assets/java.png";
import tick from "../assets/tick.png";
import copycodeicon from "../assets/copy-code-icon.png";
import version06 from "../assets/version06.png";
import version07 from "../assets/version07.png";

export const SVGS = {
  searchIcon,
  curvedArrow,
  amazon: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
  apple: "https://upload.wikimedia.org/wikipedia/commons/f/fa/apple_black.svg",
  adobe:
    "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png",
  google:
    "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
  microsoft:
    "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  dragAndDropBg,
};

export const DEMO = {
  heading: "See In Action",
  summary:
    "Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.",
};

export const FEATURES = {
  heading: "Features",
  summary:
    "With Openlogo, integrate fresh, up-to-date company logos effortlessly and leverage smart search insights for professional branding.",
  items: [
    {
      icon: databaseLogo,
      title: "Comprehensive Database",
      content:
        "Tap into a vast logo library with thousands of brands, continuously refreshed and expanding.",
    },
    {
      icon: searchLogo,
      title: "Customizable Search Insights",
      content:
        "Gain insights on search patterns to spot missing logos and keep collections comprehensive.",
    },
    {
      icon: rapidLogo,
      title: "Fast & Reliable API Access",
      content:
        "Access logos instantly with fast, dependable APIs built to minimize downtime and maximize efficiency.",
    },
  ],
};

export const HEADER_ITEMS = [
  {
    name: "home",
    title: "Home",
    url: "/#",
    type: "section",
  },
  {
    name: "docs",
    title: "Docs",
    url: "/docs",
    type: "route",
  },
  {
    name: "features",
    title: "Features",
    url: "/#features",
    type: "section",
  },
  {
    name: "pricing",
    title: "Pricing",
    url: "/#pricing",
    type: "section",
  },
  {
    name: "about",
    title: "About",
    url: "/#about",
    type: "section",
  },
];

export const LOGGEDIN_ITEMS = [
  {
    name: "home",
    title: "Home",
    url: "/#",
    type: "section",
  },
  {
    name: "docs",
    title: "Docs",
    url: "/docs",
    type: "route",
  },
  {
    name: "features",
    title: "Features",
    url: "/#features",
    type: "section",
  },
  {
    name: "pricing",
    title: "Pricing",
    url: "/#pricing",
    type: "section",
  },
  {
    name: "about",
    title: "About",
    url: "/#about",
    type: "section",
  },
];

export const LOGGEDIN_MOBILE_ITEMS = [
  LOGGEDIN_ITEMS.find((i) => i.name === "home"),
  {
    name: "dashboard",
    title: "Dashboard",
    url: "/dashboard",
    type: "route",
  },
  {
    name: "settings",
    title: "Settings",
    url: "/settings",
    type: "route",
  },
  LOGGEDIN_ITEMS.find((i) => i.name === "docs"),
  LOGGEDIN_ITEMS.find((i) => i.name === "features"),
  LOGGEDIN_ITEMS.find((i) => i.name === "pricing"),
  LOGGEDIN_ITEMS.find((i) => i.name === "about"),
];

export const FOOTER_ITEMS = [
  {
    name: "about",
    title: "About",
    url: "/#about",
  },
  {
    name: "privacy",
    title: "Privacy",
    url: "/privacy#privacy",
  },
  {
    name: "terms&conditions",
    title: "Terms",
    url: "/privacy#terms",
  },
  {
    name: "release",
    title: "Release",
    url: "/release",
  },
];

export const COMPANIES = [
  {
    _id: "A1B2C3D4E5",
    company_name: "Amazon",
    extension: "png",
    created_at: "15 Sep 2023",
    updated_at: "17 Sep 2023",
  },
  {
    _id: "F6G7H8I9J0",
    company_name: "Apple",
    extension: "png",
    created_at: "01 Oct 2024",
    updated_at: "12 Oct 2024",
  },
  {
    _id: "O1P2Q3R4S5",
    company_name: "Walmart",
    extension: "png",
    created_at: "19 Jun 2024",
    updated_at: "23 Jun 2024",
  },
  {
    _id: "T6U7V8W9X0",
    company_name: "BerkshireHathaway",
    extension: "png",
    created_at: "01 Mar 2024",
    updated_at: "10 Mar 2024",
  },
];

export const ANALYTIC_CARDS = [
  { title: "Users", api: 5.2 },
  { title: "Keys", api: -6.8 },
  { title: "Hits", api: 9.2 },
  { title: "Requests", api: -5.3 },
];

export const PASSWORD_VALIDATION_MESSAGES = {
  required: "Password is required",
  minLength: (minLength) => `Password must be at least ${minLength} characters`,
  maxLength: (maxLength) => `Password cannot exceed ${maxLength} characters`,
  uppercase: "Password must have an uppercase letter",
  lowercase: "Password must have a lowercase letter",
  digit: "Password must have a digit.",
  specialChar: "Password must have a special character",
  generalError: "Password is not secure",
};

export const CHANGE_PASSWORD = {
  currRequired: "Current password is required",
  newRequired: "New password is required",
  samePassword: "New password cannot be same as current one",
};

export const ABOUT = {
  TITLE: "What is Openlogo",
  DESCRIPTION:
    "From startups to enterprises, our platform offers an extensive collection of company logos, enabling smooth integration and consistent branding. Our APIs are designed to make logo retrieval effortless, providing scalable solutions that adapt to your business's evolving branding requirements.",
  INTEGRATIONS: [
    { id: 1, src: airbnb, alt: "Airbnb" },
    { id: 2, src: bmw, alt: "BMW" },
    { id: 3, src: byd, alt: "BYD" },
    { id: 4, src: alphabet, alt: "Alphabet" },
    { id: 5, src: adobe, alt: "Adobe" },
    { id: 6, src: google, alt: "Google" },
    { id: 7, src: ibm, alt: "IBM" },
    { id: 8, src: target, alt: "Target" },
    { id: 9, src: sap, alt: "SAP" },
    { id: 10, src: salesforce, alt: "Salesforce" },
    { id: 11, src: slack, alt: "Slack" },
    { id: 12, src: ford, alt: "Ford" },
    { id: 13, src: spotify, alt: "Spotify" },
    { id: 14, src: microsoft, alt: "Microsoft" },
    { id: 15, src: tesla, alt: "Tesla" },
    { id: 16, src: walmart, alt: "Walmart" },
  ],
};

export const FAQ = {
  TITLE: "Frequently asked questions",
  QAS: [
    {
      question: "Why should I use Openlogo?",
      answer:
        "Openlogo makes it easy to retrieve logos quickly and reliably with seamless API integration, flexible pricing, and scalable access to a growing logo library. Logo not found, no worries raise a request to add your logo.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started is easy! Sign up to create your account and generate a unique API key. With your key, explore our API features to retrieve logos or search logos using prefixs, all the provided images will be in PNG. Use our comprehensive documentation to guide your integration and testing process.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "Currently, our plans are in a free trial period, and you can use the API at no cost. We're continuously expanding our library by adding new logos every day. In the future, we plan to introduce a variety of payment methods to suit your convenience.",
    },
    {
      question: "What types of logos can I access?",
      answer:
        "Openlogo provides access to a wide range of company logos, including Fortune 500 brands and emerging startups. Our database is continuously updated to ensure you find the latest logos you need.",
    },
    {
      question: "Can I request a logo if it's not in the database?",
      answer:
        "Yes! If a logo you need is missing, you can submit a request through our platform. We strive to add new logos quickly to ensure comprehensive coverage for all users.",
    },
  ],
};

export const PRICING = {
  heading: "Compare our plans and find yours",
  summary:
    "Simple, transparent pricing that grows with you. Try any plan free for 30 days.",
  plans: [
    {
      index: 0,
      name: "HOBBY",
      pricing: 0,
      tagline: "Try for free for individuals",
      keypoints: [
        "Fortune 500 company logo",
        "500 API calls per month",
        "2 API keys",
        "Basic analytics",
        "48-72 hour of response time",
      ],
    },
    {
      index: 1,
      name: "PRO",
      pricing: 1500,
      tagline: "Grow with pro plan.",
      keypoints: [
        "Hobby plan plus",
        "10000 API calls per month",
        "5 API keys",
        "Advance analytics",
        "12-36 hours of response time",
      ],
    },
  ],
};

export const SETTING = [
  {
    title: "Download account data",
    subtitle: "Download your account data and move to other device with ease.",
    buttontitle: "Download",
    action: "download",
  },
  {
    title: "Delete account",
    subtitle:
      "This will permanently delete your account and all associated data.",
    buttontitle: "Delete Account",
    action: "delete",
  },
];

export const USER_INFO_FIELDS = [
  { type: "text", name: "name", label: "Username" },
  { type: "email", name: "email", label: "Email" },
];

export const HAMBURGER = {
  src: "hamburger.svg",
  alt: "Hamburger Icon",
};

export const CROSS = {
  src: "close-icon.svg",
  alt: "Close Icon",
};

export const COPY = {
  src: "copy-icon.svg",
  alt: "Copy Icon",
};

export const TICK = {
  src: tick,
  alt: "Tick Icon",
};

export const BUTTON_TEXT = {
  getStarted: "Get started",
  gotoDashboard: "Go to Dashboard",
  active: "Active",
  commingSoon: "Coming Soon",
  documentation: "Documentation",
  signUp: "Sign Up",
  signIn: "Sign In",
  signOut: "Sign Out",
  changePasswordLabel: "Change password",
  forgotPassword: "Forgot password?",
  cross: `×`,
  sendMessage: "Send message",
  delete: "Delete",
  generateKey: "Generate Key",
  requestLogo: "Request Logo",
  createLogo: "Create Logo",
  goToHome: "Go to Home",
  submit: "Submit",
  backToSignIn: " Back to Sign In",
  cancel: "Cancel",
  upgrade: "Upgrade",
  respond: "Respond",
  reject: "Reject",
  sendResponse: "Send Response",
  confirmRejection: "Confirm Rejection",
  sendRequest: "Send Request",
  upload: "Upload",
  selectAnImage: "Select an image",
  uploadLogo: "Upload Logo",
};

export const BRANDING = {
  imageSrc: "openlogo.svg",
  imageSrcDark: "openlogo-white.svg",
  imageAlt: "Brand Logo",
  brandName: "Openlogo",
  poweredByText: "Powered by TeamShiksha",
  poweredByLink: "https://team.shiksha",
};

export const CODEBLOCK = {
  jsLogo,
  pythonLogo,
  javaLogo,
  tick,
  copycodeicon,
};

export const HERO_SECTION = {
  tagLine: "Access hundreds of logos with just one line of code",
  summary:
    "A collection of APIs designed to simplify the process of obtaining company logos. Generate API keys in seconds.",
  illustractionSrc: "logo-images.png",
  illustractionSrcAlt: "illustraction",
};

export const PRIVACY_AND_TERMS = [
  {
    HEADLINE: "Privacy and Terms",
    DATA_ID: "#",
    TEXTS: [
      "Thank you for choosing Openlogo! Before using our services, please review our Terms of Service carefully. This agreement is a crucial contract between us and our users. We've provided a concise summary followed by the complete legal terms.",
    ],
  },
  {
    HEADLINE: "Privacy Policy",
    DATA_ID: "privacy",
    TEXTS: [
      "This Privacy Policy explains how Openlogo collects, uses, and protects your personal information when you use our website and services. By using Openlogo's services, you agree to the terms of this Privacy Policy. Your privacy is important to us, and we are committed to safeguarding your personal information.",
      "Openlogo collects personal information such as your name, email address, and other details when you register for an account or use specific features on our platform. We also gather usage data about how you interact with our website and services, including pages viewed, features used, and your activity within our platform. If you contact us for support or inquiries, we may collect and store those communications.",
      "The information collected is used to provide and enhance our services, manage your account, communicate with you about updates, offers, and newsletters, and perform business analysis to optimize site performance and security. We may also use your information to personalize your experience on Openlogo and improve our services based on your preferences.",
      "Openlogo uses cookies and similar tracking technologies to enhance your browsing experience, improve website functionality, and analyze site traffic. These technologies help us understand how users interact with our platform, allowing us to optimize performance, provide seamless navigation, and offer a more personalized experience tailored to your preferences.",
      "We utilize different types of cookies, including essential cookies that enable core website functions such as authentication and security, as well as performance and analytics cookies that help us measure traffic and analyze usage trends. Functional cookies store your preferences, such as language settings, to make your interactions with our platform smoother. Additionally, marketing and advertising cookies assist in delivering relevant promotions and personalized content based on your interests.",
      "You can manage your cookie preferences through your browser settings. However, please note that disabling certain cookies may affect website functionality and limit access to some features.",
      "We take reasonable precautions to protect your personal data from unauthorized access, disclosure, alteration, and destruction. However, no method of data transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. We retain your personal data only as long as necessary to fulfill its purpose or as required by law.",
      "Openlogo's services are not intended for children under 13. We do not knowingly collect personal information from anyone under this age. If you believe that we have inadvertently collected personal information from a child under 13, please contact us immediately, and we will take steps to delete such data.",
      "We may update this Privacy Policy periodically to reflect changes in our practices, services, or legal requirements. When updates are made, they will be posted on the website, and the effective date will be updated accordingly. We encourage you to review this policy regularly to stay informed about how we are protecting your personal information.",
    ],
  },
  {
    HEADLINE: "Terms of Services",
    DATA_ID: "terms",
    TEXTS: [
      "By using Openlogo's website and services, you agree to comply with the following terms and conditions. You must abide by all applicable laws and regulations while using our services. You are responsible for maintaining the confidentiality of your account credentials, including your password, and for all activities that occur under your account.",
      "Openlogo reserves the right to modify or discontinue services, in whole or in part, at any time without prior notice. We are not liable for any direct or indirect damages resulting from the use of our services, including but not limited to loss of data, loss of revenue, or business interruption.",
      "Openlogo may, from time to time, offer promotional codes, discounts, or special offers that are subject to additional terms and conditions. We reserve the right to cancel or modify any offers at our discretion. These offers may be available for limited periods and are subject to availability.",
      "You agree not to misuse Openlogo's services, including but not limited to engaging in illegal activities, spamming, or violating the intellectual property rights of others. Failure to comply with these terms may result in the suspension or termination of your account.",
      "Openlogo is not responsible for any third-party services or websites linked to our platform. Please read their respective privacy policies and terms before engaging with them.",
      "If you have any questions about this Privacy Policy or our Terms and Conditions, please contact us through our contact page. We are here to help you understand and navigate our policies.",
    ],
  },
];

export const SIGNUP = {
  title: "Sign up for free",
  description: "Create your account and start integrating in seconds",
  termsUrl: "/privacy#terms",
  privacyUrl: "/privacy#privacy",
  fields: [
    { type: "text", name: "name", label: "Name", autoComplete: "username" },
    { type: "email", name: "email", label: "Email", autoComplete: "email" },
    {
      type: "password",
      name: "password",
      label: "Password",
      autoComplete: "new-password",
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      autoComplete: "new-password",
    },
  ],
  footerText: "Already have an account ?",
  signinToggleButtonText: "Login",
  initialValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

export const SIGNIN = {
  title: "Sign in to your account",
  description: "Welcome back! Please enter your details",
  fields: [
    { type: "email", name: "email", label: "Email" },
    {
      type: "password",
      name: "password",
      label: "Password",
      autoComplete: "current-password",
    },
  ],
  guestAccount: "Continue as Guest",
  footerText: "Don't have an account ?",
  signupToggleButtonText: "Create an account",
  initialValues: { email: "", password: "" },
};

export const CONTACT = {
  title: "Contact Us",
  fields: [
    { type: "text", name: "name", label: "Name" },
    { type: "email", name: "email", label: "Email" },
  ],
  initialValues: {
    name: "",
    email: "",
    message: "",
  },
};

export const LOGOREQUEST = {
  title: "Request Logo",
  initialValues: {
    companyUrl: "",
  },
};

export const LOGOUPLOAD = {
  title: "Upload Logo",
  initialValues: {
    companyUrl: "",
  },
};

export const CODE_EXAMPLE_SEARCH = (baseUrl) => ({
  curl: `curl --request GET \\
  --url '${baseUrl}/logo/search?key=goo&API_KEY=YOUR_API_KEY'`,

  javascript: `const response = await fetch(
  "${baseUrl}/logo/search?key=goo&API_KEY=YOUR_API_KEY",
  {
    method: "GET",
  }
);

const data = await response.json();`,

  python: `import requests

response = requests.get(
  "${baseUrl}/logo/search",
  params={"key": "goo", "API_KEY": "YOUR_API_KEY"},
)

data = response.json()`,
});

export const CODE_EXAMPLE = (baseUrl) => ({
  curl: `curl --request GET \\
  --url '${baseUrl}/logo?key=google.com&API_KEY=YOUR_API_KEY'`,

  javascript: `const response = await fetch(
  "${baseUrl}/logo?key=google.com&API_KEY=YOUR_API_KEY",
  {
    method: "GET",
  }
);

const data = await response.json();`,

  python: `import requests

response = requests.get(
  "${baseUrl}/logo",
  params={"key": "google.com", "API_KEY": "YOUR_API_KEY"},
)

data = response.json()`,
});

export const DOCUMENTATION = {
  introduction: {
    heading: "Introduction",
    text: "Welcome to the Openlogo API documentation. Openlogo is a high-performance, real-time logo retrieval service designed to help you integrate brand assets directly into your applications.",
  },
  tableDataHeaders: ["Parameter", "Type", "Description", "Required"],
  apiDocs: [
    {
      heading: "Logo Retrieval",
      text: "Fetch the official logo for any company using their domain name. Our system automatically detects the best quality asset, including high-resolution SVGs and PNGs.",
      endPoint: "Endpoint: /logo?key={domain}&API_KEY={YOUR_API_KEY}",
      tableDataContent: [
        [
          "key",
          "string",
          "The domain name of the company (e.g., apple.com).",
          "Yes",
        ],
        ["API_KEY", "string", "Generated API Key from the dashboard.", "Yes"],
      ],
      codeExample: CODE_EXAMPLE,
    },
    {
      heading: "Search Logos",
      text: "Find logos by brand keyword or domain fragment. This endpoint returns matching logos for faster discovery workflows.",
      endPoint: "Endpoint: /logo/search?key={query}&API_KEY={YOUR_API_KEY}",
      tableDataContent: [
        [
          "key",
          "string",
          "Search query (brand name or domain fragment).",
          "Yes",
        ],
        ["API_KEY", "string", "Generated API Key from the dashboard.", "Yes"],
      ],
      codeExample: CODE_EXAMPLE_SEARCH,
    },
  ],
  customerSupportText: [
    "If you're unable to find the logo you need, please don't hesitate to ",
    ". Our team will be happy to assist you in locating the appropriate logo. Additionally, you can refer to the provided examples for guidance. If you still require further support, our dedicated support team is available to help with any additional questions or concerns.",
  ],
  localUrl: "Base URL: http://localhost:5000/api",
  baseStageUrl: "Base URL: https://api-stage.openlogo.fyi/api",
  baseProdUrl: "Base URL: https://api.openlogo.fyi/api",
};

export const API_KEY_TABLE = {
  headers: ["Description", "Created", "Expires", "Action"],
  emptyMessage:
    "Your api keys will be visible here, click on generate key to add new api key",
};

export const DASHBOARD_CARDS_TITLE = ["Usage", "Generate New API Key"];
export const USER_SETTINGS_TITLE = [
  "Plan",
  "User Info",
  "Change Password",
  "Setting",
];
export const MOCK_USER_DATA = {
  userId: "68239354add509808d8ee401",
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
  subscription: {
    usage_count: 42,
    usage_limit: 100,
    type: "HOBBY",
  },
  keys: [
    {
      key_description: "Testing Environment Key",
      updated_at: "2023-10-30T11:20:00.000Z",
    },
    {
      key_description: "Analytics Service Key",
      updated_at: "2023-11-10T13:10:00.000Z",
    },
  ],
};

export const EMAIL_DOES_NOT_EXIST = {
  MESSAGE: "This email does not exist",
};

export const NOT_FOUND_PAGE = {
  TITLE: "404 - Page Not Found",
  MESSAGE: "The page you are looking for does not exist.",
};

export const VERIFICATION = {
  title: "Verifying",
  message: "Please wait, while we verify your email.",
};

export const DELETE_ACCOUNT_MODAL = {
  title: "Confirm Deletion",
  subText:
    "Are you sure you want to delete your account? This action cannot be undone.",
  primaryButtonText: "Delete",
  secondaryButtonText: "Cancel",
};

export const CONFIRMATION_MODAL = {
  heading: "Confirm Action",
  description: "Are Your Sure?",
  primaryButtonText: "Confirm",
  secondaryButtonText: "Cancel",
};

export const API_KEY = {
  generation: {
    success: "API key generated successfully",
    error: "Failed to generate API key",
    descriptionRequired: "Please enter a description for the API key",
    modal: {
      title: "Your API Key",
      warning:
        "Please copy your API key now. You won't be able to see it again!",
      expiryLabel: "This key will expire on:",
    },
  },
  copy: {
    success: "API key copied to clipboard",
  },
  delete: {
    success: "API key deleted successfully",
    error: "Failed to delete API key",
    invalidKey: "Invalid API key selected",
    modal: {
      title: "Delete API Key",
      description: "Are you sure you want to delete the API key",
      warning: "This action cannot be undone.",
    },
  },
};

export const MESSAGES = {
  ACCOUNT_DELETE_SUCCESS: "Account deleted successfully",
  SIGN_IN_SUCCESS: "Sign in successfully",
  GUEST_SIGN_IN_SUCCESS: "Signed in as guest successfully",
  SIGN_OUT_SUCCESS: "Sign out successfully",
  SIGN_UP_SUCCESS: "Sign up successfully",
  USERNAME_UPDATE_SUCCESS: "Username updated successfully",
  IMAGE_UPLOAD_SUCCESS: "Image uploaded successfully.",
  IMAGE_UPDATE_SUCCESS: "Image updated successfully.",
  IMAGE_UPLOAD_ERROR: "Failed to upload image.",
  IMAGE_UPDATE_ERROR: "Failed to update image.",
  NO_RESULT_FOUND: "No results found matching your query!",
  UPLOAD_VALID_IMAGE: "Please upload a valid PNG image file",
  UPDATE_PASSWORD_SUCCESS: "Password updated successfully",
  VERIFICATION_EMAIL_SENT:
    "Verification email sent. Please verify your account.",
  REST_EMAIL_SENT: "Reset email sent. Check your inbox.",
};

export const MODAL_MESSAGES = {
  RESPOND: "Type your response here...",
  REJECT: "Reason for rejection...",
  CHARACTER_LIMIT: "100",
};

export const MOCK_OPERATOR_CARD_DATA = {
  _id: "683c76bdc92459606a4f",
  name: "Charan Praveen",
  email: "charan@example.com",
  companyUrl: "https://example.com",
  message: "This is a sample message to test",
  status: "PENDING",
  openedAt: "2024-01-01T00:00:00Z",
  closedAt: "2024-01-02T00:00:00Z",
  comment: "Issue resolved after the discussion",
};

export const OPERATOR_MESSAGES = {
  data: {
    results: [
      {
        _id: "1",
        status: "PENDING",
        name: "Test User",
        email: "test@example.com",
        message: "Test message",
        openedAt: "2025-06-01T00:00:00Z",
      },
    ],
    totalPages: 1,
  },
};
export const OPERATOR_ARCHIVED_MESSAGES = {
  data: {
    results: [
      {
        _id: "2",
        status: "RESOLVED",
        name: "Test User",
        email: "test@example.com",
        message: "Test message",
        openedAt: "2025-06-01T00:00:00Z",
        closedAt: "2025-06-02T00:00:00Z",
        comment: "Resolved this comment a long ago",
      },
    ],
    totalPages: 1,
  },
};

export const USAGE = {
  callsText: "Calls",
  limitText: "Limit",
  resetText: "Resets every month.",
};

export const CURRENT_PLAN = {
  plan: "Hobby",
  tagline: "Empower your projects with essential tools, at no cost.",
};

export const CHANGE_PASSWORD_FIELDS = [
  { type: "password", name: "currPassword", label: "Current Password" },
  { type: "password", name: "newPassword", label: "New Password" },
];

export const API_KEY_FORM = {
  tagLine: "Generate a new API key to use in your projects.",
  expiryLabel: "Expiry Period",
  expiryDescription: "Choose how long your API key will remain valid.",
};
export const EXPIRY_KEYS_OPTION = [
  { value: 7, label: "1 Week" },
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
  { value: 180, label: "6 Months" },
  { value: 365, label: "1 Year" },
];
export const IMAGE_UPLOAD_MODEL = {
  dragAndDropImage: "Drag and drop image",
  or: "OR",
};

export const USER_SUBSCRIPTIONS = {
  title: "User Subscriptions",
  subtitle: "View and manage subscription plans for all users.",
  searchPlaceholder: "Search by name or email...",
  tableHeaders: ["User", "Plan", "Usage", ""],
  plans: {
    HOBBY: "Hobby",
    PRO: "Pro",
  },
  modal: {
    title: "Change Subscription Plan",
    planLabel: "Select Plan",
    reasonLabel: "Reason (optional)",
    reasonPlaceholder: "Provide a reason for the plan change...",
    confirmButton: "Confirm Change",
  },
  emptyState: "No users found matching your search.",
  toasts: {
    success: "Subscription plan updated successfully.",
    error: "Failed to update subscription plan.",
  },
};

export const SUBSCRIPTION_LOGS = {
  title: "Subscription Logs",
  subtitle: "Audit trail of all subscription plan changes.",
  tableHeaders: ["Date", "User", "Changed By", "From", "To", "Reason"],
  plans: {
    HOBBY: "Hobby",
    PRO: "Pro",
  },
  emptyState: "No subscription changes have been recorded yet.",
  toasts: {
    error: "Failed to load subscription logs.",
  },
};

export const SUBSCRIPTION_PANEL = {
  tabs: {
    subscriptions: "User Subscriptions",
    logs: "Subscription Logs",
  },
};

export const MILESTONE_CONFIG = {
  title: "Rewards Milestone Configuration",
  subtitle: "Manage reward milestone thresholds and activate configurations.",
  createButton: "Create Config",
  tableHeaders: ["Name", "Thresholds", "Status", ""],
  status: {
    active: "Active",
    inactive: "Inactive",
  },
  modal: {
    createTitle: "Create Milestone Config",
    editTitle: "Edit Milestone Config",
    nameLabel: "Configuration Name",
    namePlaceholder: "e.g. Q3 2026 Campaign",
    thresholdsLabel: "Reward Thresholds",
    atLabel: "At (submissions)",
    pointsLabel: "Points",
    addThreshold: "Add Threshold",
    removeThreshold: "Remove",
    saveButton: "Save",
    cancelButton: "Cancel",
  },
  activate: {
    heading: "Activate Configuration",
    description:
      "Activating this configuration will deactivate the currently active one. The new configuration takes effect on the next worker run.",
    confirmButton: "Activate",
  },
  delete: {
    heading: "Delete Configuration",
    description:
      "Are you sure you want to delete this configuration? This action cannot be undone.",
    confirmButton: "Delete",
  },
  emptyState: "No milestone configurations found. Create one to get started.",
  toasts: {
    createSuccess: "Milestone configuration created successfully.",
    createError: "Failed to create milestone configuration.",
    updateSuccess: "Milestone configuration updated successfully.",
    updateError: "Failed to update milestone configuration.",
    activateSuccess: "Milestone configuration activated successfully.",
    activateError: "Failed to activate milestone configuration.",
    deleteSuccess: "Milestone configuration deleted successfully.",
    deleteError: "Failed to delete milestone configuration.",
    loadError: "Failed to load milestone configurations.",
  },
};

export const IMAGE_REWARD_MODAL = {
  title: "Image Reward Stats",
  subtitle: "View reward summary and transaction history for this image.",
  summary: {
    proUsers: "Pro Users",
    totalPoints: "Total Points Awarded",
    milestones: "Milestones Achieved",
    nextMilestone: "Next Milestone",
  },
  transactions: {
    title: "Transaction History",
    headers: ["Type", "Points", "User", "Reason", "Date"],
    emptyState: "No transactions found for this image.",
  },
  bonus: {
    button: "Award Bonus",
    pointsLabel: "Points",
    reasonLabel: "Reason",
    reasonPlaceholder: "Select a reason...",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Additional details...",
    confirmButton: "Award Points",
    cancelButton: "Cancel",
    submittingText: "Awarding...",
    success: "Bonus points awarded successfully.",
    error: "Failed to award bonus points.",
    validation: {
      pointsRequired: "Please enter a valid positive number of points.",
      reasonRequired: "Please select a reason for the bonus.",
    },
    reasonOptions: [
      { value: "PROMOTION", label: "Promotion" },
      { value: "MANUAL_CORRECTION", label: "Manual Correction" },
    ],
  },
  toasts: {
    summaryError: "Failed to load reward summary.",
    transactionsError: "Failed to load transactions.",
  },
};

export const REWARD_PANEL = {
  tabs: {
    milestones: "Milestones",
    userRewards: "User Rewards",
  },
};

export const ADMIN_USER_REWARDS = {
  title: "User Rewards",
  subtitle:
    "Search users and view their reward summary and transaction history.",
  searchPlaceholder: "Search by name or email...",
  tableHeaders: ["User", "Plan", "Points", ""],
  emptyState: "No users found matching your search.",
  detail: {
    title: "Reward Details",
    awardBonus: "Award Bonus",
    stats: {
      totalTransactions: "Total Transactions",
      totalPoints: "Total Points Awarded",
    },
    breakdownTitle: "Transaction Breakdown",
    breakdownHeaders: ["Type", "Count", "Total Points"],
    historyTitle: "Transaction History",
    historyHeaders: ["Type", "Points", "Reason", "Date", ""],
    emptyHistory: "No transactions found for this user.",
  },
  bonusModal: {
    title: "Award Bonus Points",
    pointsLabel: "Points",
    reasonLabel: "Reason",
    reasonPlaceholder: "e.g. Promotion, referral bonus",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Additional details...",
    confirmButton: "Award Points",
    cancelButton: "Cancel",
    submittingText: "Awarding...",
    success: "Bonus points awarded successfully.",
    error: "Failed to award bonus points.",
    validation: {
      pointsRequired: "Please enter a valid positive number of points.",
      reasonRequired: "Please select a reason for the bonus.",
    },
    reasonOptions: [
      { value: "PROMOTION", label: "Promotion" },
      { value: "MANUAL_CORRECTION", label: "Manual Correction" },
      { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
    ],
  },
  reverseModal: {
    title: "Reverse Transaction",
    description: (points, type) =>
      `This will reverse the ${type} transaction of ${points} points. The user's points balance will be decreased accordingly.`,
    reasonLabel: "Reversal Reason",
    reasonPlaceholder: "Select a reason...",
    confirmButton: "Reverse Transaction",
    cancelButton: "Cancel",
    submittingText: "Reversing...",
    success: "Transaction reversed successfully.",
    error: "Failed to reverse transaction.",
    validation: {
      reasonRequired: "Please select a reason for the reversal.",
    },
    reversalReasonOptions: [
      { value: "DUPLICATE_REMOVAL", label: "Duplicate Removal" },
      { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
      { value: "MANUAL_CORRECTION", label: "Manual Correction" },
      { value: "SYSTEM_ERROR", label: "System Error" },
    ],
  },
  toasts: {
    loadError: "Failed to load user rewards.",
  },
};

export const USER_REWARDS_DASHBOARD = {
  title: "My Rewards",
  subtitle: "Track your reward points, milestones, and transaction history.",
  stats: {
    currentPoints: "Current Points",
    lifetimePoints: "Lifetime Points",
    totalImages: "Images Contributed",
    avgPoints: "Avg Points / Image",
  },
  images: {
    title: "My Images",
    subtitle: "Images you've uploaded and their reward performance.",
    emptyState: "No images uploaded yet.",
    points: "Points",
  },
  breakdown: {
    title: "Transaction Breakdown",
    headers: ["Type", "Count", "Total Points"],
    emptyState: "No transactions yet.",
  },
  history: {
    title: "Transaction History",
    headers: ["Type", "Points", "Image", "Reason", "Date"],
    emptyState: "No transactions yet.",
  },
  viewLeaderboard: "View Leaderboard",
  uploadImage: "Upload Image",
  toasts: {
    summaryError: "Failed to load reward summary.",
    statsError: "Failed to load transaction stats.",
    historyError: "Failed to load transaction history.",
    leaderboardError: "Failed to load leaderboard.",
    rankError: "Failed to load your rank.",
  },
};

export const LEADERBOARD_PAGE = {
  title: "Leaderboard",
  subtitle: "Top creators ranked by total reward points earned.",
  yourPosition: "Your Position",
  notRanked: "You haven't earned any rewards yet.",
  outOf: "out of",
  users: "creators",
  backToRewards: "Back to My Rewards",
  headers: ["Rank", "User", "Points", "Milestones"],
  emptyState: "No leaderboard data yet.",
  toasts: {
    loadError: "Failed to load leaderboard.",
    rankError: "Failed to load your rank.",
  },
};

export const RELEASE_PAGE = {
  introduction: {
    heading: "About",
    description:
      "Openlogo is an open-source platform offering fast, reliable access to an extensive library of company logos—from global enterprises to emerging startups. With seamless API integration and a constantly updated database, Openlogo makes retrieving logos effortless and scalable.",
    features: [
      {
        heading: "Comprehensive Brand Database",
        desc: "Instant access to a vast, constantly updated library of high-quality company logos, ranging from Fortune 500 enterprises to emerging startups.",
      },
      {
        heading: "High-Performance API Integration",
        desc: "A developer-first API optimized for speed and reliability, featuring intelligent caching to ensure millisecond response times for effortless logo retrieval.",
      },
      {
        heading: "Quick Search & Insights",
        desc: "Advanced search algorithms that not only locate logos with precision.",
      },
      {
        heading: "Community-Driven Requests",
        desc: "A streamlined workflow allowing users to request missing logos directly from the dashboard, ensuring the database evolves based on real-world user needs.",
      },
      {
        heading: "Transparent Release Timeline",
        desc: "A detailed, visual changelog that keeps users informed of every update, performance improvement, and contributor credit in real-time.",
      },
    ],
  },

  versions: [
    "0.8.0 version",
    "0.7.0 version",
    "0.6.0 version",
    "Previous version",
  ],
  latestVersion: "0.8.0 version",
  changelog: {
    title: "Changelog",
    description: "Changelog with often recorded's versions",
    versionsData: [
      {
        versionName: "0.8.0 version",
        releaseDate: "May 2026",
        imgSrc: version07,
        releaseNotes: [
          {
            releaseNote: "Revamp USER dashboard according to the design.",
            contributors: [
              {
                contributorName: "AryaDharkar",
                contributorGithubLink: "https://github.com/AryaDharkar",
              },
            ],
          },
          {
            releaseNote: "Enhancing the UI of the admin dashboard.",
            contributors: [
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
            ],
          },
          {
            releaseNote: "Add 2FA section in user settings.",
            contributors: [
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
            ],
          },
          {
            releaseNote: "Implementing a dedicated settings page for MFA.",
            contributors: [
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
            ],
          },
          {
            releaseNote: "Multi factor authentication.",
            contributors: [
              {
                contributorName: "MukeshAbhi",
                contributorGithubLink: "https://github.com/MukeshAbhi",
              },
            ],
          },
          {
            releaseNote:
              "Prevent Users From Reusing Old Password During Password Reset.",
            contributors: [
              {
                contributorName: "rishang14",
                contributorGithubLink: "https://github.com/rishang14",
              },
            ],
          },
          {
            releaseNote:
              "Fix bugs on createLogo page and allow users to access this page without authentication.",
            contributors: [
              {
                contributorName: "AryaDharkar",
                contributorGithubLink: "https://github.com/AryaDharkar",
              },
            ],
          },
          {
            releaseNote: "Feature for user session management.",
            contributors: [
              {
                contributorName: "kadamsahil2511",
                contributorGithubLink: "https://github.com/kadamsahil2511",
              },
              {
                contributorName: "DeepAkdotcom",
                contributorGithubLink: "https://github.com/DeepAkdotcom",
              },
            ],
          },
          {
            releaseNote:
              "Feature to enforce branch & PR naming conventions via husky + GitHub Actions.",
            contributors: [
              {
                contributorName: "Smayur0",
                contributorGithubLink: "https://github.com/Smayur0",
              },
            ],
          },
          {
            releaseNote: "Redesign documentation page.",
            contributors: [
              {
                contributorName: "Dhirenderchoudhary",
                contributorGithubLink: "https://github.com/Dhirenderchoudhary",
              },
            ],
          },
          {
            releaseNote: "Revamp sign in and sign up form",
            contributors: [
              {
                contributorName: "0-mstrmind",
                contributorGithubLink: "https://github.com/0-mstrmind",
              },
              {
                contributorName: "kunjesh360",
                contributorGithubLink: "https://github.com/kunjesh360",
              },
            ],
          },
        ],
      },
      {
        versionName: "0.7.0 version",
        releaseDate: "Mar 2026",
        imgSrc: version07,
        releaseNotes: [
          {
            releaseNote:
              "Authentication has been migrated from JWT to a secure session-based system, improving overall security and simplifying token management.",
            contributors: [
              {
                contributorName: "Mantu01",
                contributorGithubLink: "https://github.com/Mantu01",
              },
              {
                contributorName: "Smayur0",
                contributorGithubLink: "https://github.com/Smayur0",
              },
              {
                contributorName: "printgourav",
                contributorGithubLink: "https://github.com/printgourav",
              },
            ],
          },
          {
            releaseNote:
              "You can now switch between Light and Dark themes to personalize your experience.",
            contributors: [
              {
                contributorName: "sachinkmrsin",
                contributorGithubLink: "https://github.com/sachinkmrsin",
              },
            ],
          },
          {
            releaseNote:
              "Notifications are now available for important events such as API expiry and usage limit being reached, so you never miss critical updates.",
            contributors: [
              {
                contributorName: "YashDevani-source",
                contributorGithubLink: "https://github.com/YashDevani-source",
              },
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
            ],
          },
          {
            releaseNote:
              "You can now create and use your own custom logo image directly within the platform.",
            contributors: [
              {
                contributorName: "biplab-sutradhar",
                contributorGithubLink: "https://github.com/biplab-sutradhar",
              },
              {
                contributorName: "mridul-giri",
                contributorGithubLink: "https://github.com/mridul-giri",
              },
            ],
          },
          {
            releaseNote:
              "API keys are now securely hidden to prevent accidental exposure and enhance account security.",
            contributors: [
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
            ],
          },
        ],
      },
      {
        versionName: "0.6.0 version",
        releaseDate: "Dec 2025",
        imgSrc: version06,
        releaseNotes: [
          {
            releaseNote:
              "You can now view a simple graph on your dashboard that helps you understand how much you’re using the API, including how many requests you’ve made and how much data you’ve used.",
            contributors: [
              {
                contributorName: "L-Tarun-Aditya",
                contributorGithubLink: "https://github.com/L-Tarun-Aditya",
              },
              {
                contributorName: "sachinkmrsin",
                contributorGithubLink: "https://github.com/sachinkmrsin",
              },
              {
                contributorName: "YashDevani-source",
                contributorGithubLink: "https://github.com/YashDevani-source",
              },
            ],
          },
          {
            releaseNote:
              "API keys now expire automatically to keep accounts more secure. Users can set a custom expiry date, and existing API keys will expire after one year by default.",
            contributors: [
              {
                contributorName: "biplab-sutradhar",
                contributorGithubLink: "https://github.com/biplab-sutradhar",
              },
              {
                contributorName: "printgourav",
                contributorGithubLink: "https://github.com/printgourav",
              },
            ],
          },
          {
            releaseNote:
              "Catalogs are now created automatically, so you don’t need to set them up manually anymore.",
            contributors: [
              {
                contributorName: "BansalAbhinav",
                contributorGithubLink: "https://github.com/BansalAbhinav",
              },
              {
                contributorName: "Saurabhupadhyay8170",
                contributorGithubLink: "https://github.com/Saurabhupadhyay8170",
              },
            ],
          },
          {
            releaseNote:
              "A new Release Page is now available, where you can easily see what’s new in each version and who helped build it.",
            contributors: [
              {
                contributorName: "abhishek-2k23",
                contributorGithubLink: "https://github.com/abhishek-2k23",
              },
            ],
          },
          {
            releaseNote:
              "If you don’t receive your verification email, you can now resend it easily and continue without getting stuck.",
            contributors: [
              {
                contributorName: "MukeshAbhi",
                contributorGithubLink: "https://github.com/MukeshAbhi",
              },
            ],
          },
        ],
      },
      {
        versionName: "Previous version",
        releaseDate: "Oct 2024",
        imgSrc: version06,
        releaseNotes: [
          {
            releaseNote:
              "Dates are now displayed in a consistent and clear format across the entire platform.",
            contributors: [
              {
                contributorName: "Sumitgitup",
                contributorGithubLink: "https://github.com/Sumitgitup",
              },
            ],
          },
          {
            releaseNote:
              "You can now easily download a copy of your data from the platform whenever you need it.",
            contributors: [
              {
                contributorName: "Sumitgitup",
                contributorGithubLink: "https://github.com/Sumitgitup",
              },
            ],
          },
          {
            releaseNote:
              "Navigation has been simplified by grouping Dashboard and Sign Out options under a single profile menu.",
            contributors: [
              {
                contributorName: "abhishek-2k23",
                contributorGithubLink: "https://github.com/abhishek-2k23",
              },
              {
                contributorName: "nazibul7",
                contributorGithubLink: "https://github.com/nazibul7",
              },
            ],
          },
          {
            releaseNote:
              "Updates made by admins now show up instantly, so users always see the latest content without delays.",
            contributors: [
              {
                contributorName: "MukeshAbhi",
                contributorGithubLink: "https://github.com/MukeshAbhi",
              },
            ],
          },
          {
            releaseNote:
              "Image uploads are now faster and more stable, especially when uploading large files.",
            contributors: [
              {
                contributorName: "printgourav",
                contributorGithubLink: "https://github.com/printgourav",
              },
              {
                contributorName: "YashDevani-source",
                contributorGithubLink: "https://github.com/YashDevani-source",
              },
            ],
          },
          {
            releaseNote:
              "If you miss the verification email, you can now resend it directly without any hassle.",
            contributors: [
              {
                contributorName: "MukeshAbhi",
                contributorGithubLink: "https://github.com/MukeshAbhi",
              },
            ],
          },
          {
            releaseNote:
              "Admins can now quickly see how many images are stored in the system from the dashboard.",
            contributors: [
              {
                contributorName: "printgourav",
                contributorGithubLink: "https://github.com/printgourav",
              },
            ],
          },
          {
            releaseNote:
              "The platform moved from Firebase to MongoDB to better support growth and handle data more efficiently.",
            contributors: [
              {
                contributorName: "amankumarsingh77",
                contributorGithubLink: "https://github.com/amankumarsingh77",
              },
            ],
          },
          {
            releaseNote:
              "Testing was improved by switching to a faster and more reliable testing setup.",
            contributors: [
              {
                contributorName: "Ayushsanjdev",
                contributorGithubLink: "https://github.com/Ayushsanjdev",
              },
            ],
          },
          {
            releaseNote:
              "A new Operator dashboard was added to make it easier to manage and respond to customer queries.",
            contributors: [
              {
                contributorName: "asharma991",
                contributorGithubLink: "https://github.com/asharma991",
              },
            ],
          },
          {
            releaseNote:
              "Admins gained the ability to re-upload images with checks to ensure correct file names and formats.",
            contributors: [
              {
                contributorName: "Soumava-221B",
                contributorGithubLink: "https://github.com/Soumava-221B",
              },
            ],
          },
          {
            releaseNote:
              "Subscription usage limits are now reset automatically every month, removing the need for manual updates.",
            contributors: [
              {
                contributorName: "DeltaDynamo",
                contributorGithubLink: "https://github.com/DeltaDynamo",
              },
            ],
          },
          {
            releaseNote:
              "Several visual and usability improvements were made across the footer, About page, and sign-in experience.",
            contributors: [
              {
                contributorName: "AryaDharkar",
                contributorGithubLink: "https://github.com/AryaDharkar",
              },
            ],
          },
          {
            releaseNote:
              "A new logo search feature was added, making it easier to find and retrieve logos securely.",
            contributors: [
              {
                contributorName: "DeltaDynamo",
                contributorGithubLink: "https://github.com/DeltaDynamo",
              },
            ],
          },
          {
            releaseNote:
              "Navigation behavior was improved so pages smoothly return to the top when links are clicked.",
            contributors: [
              {
                contributorName: "Asin-Junior-Honore",
                contributorGithubLink: "https://github.com/Asin-Junior-Honore",
              },
            ],
          },
          {
            releaseNote:
              "An extra confirmation step was added before deleting API keys to help prevent accidental deletions.",
            contributors: [
              {
                contributorName: "anandbaraik",
                contributorGithubLink: "https://github.com/anandbaraik",
              },
            ],
          },
          {
            releaseNote:
              "API keys can now be viewed or copied only once, improving overall account security.",
            contributors: [
              {
                contributorName: "Sharathxct",
                contributorGithubLink: "https://github.com/Sharathxct",
              },
            ],
          },
        ],
      },
    ],
  },
};
