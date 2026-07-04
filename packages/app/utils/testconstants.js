const dummyPassword = require("./generatePassword").generatePassword();

const SIGNUP_PAYLOAD = {
  name: "TESTNAME",
  email: "testname@gmail.com",
  password: dummyPassword,
  confirmPassword: dummyPassword,
};

const ENDPOINTS = {
  SIGNUP: "/api/auth/signup",
  SIGNIN: "/api/auth/signin",
  SIGNOUT: "/api/auth/signout",
  VERIFY: "/api/auth/verify",
  FORGOT_PASSWORD: "/api/auth/password/forgot",
  RESET_PASSWORD_SESSION: "/api/auth/password/forgot",
  RESET_PASSWORD: "/api/auth/password/reset",
  MESSAGES: "/api/messages",
  REQUESTS: "/api/requests",
  ENABLE_MFA: "/api/auth/mfa/enable",
  VERIFY_MFA: "/api/auth/mfa/verify",
  CANCEL_MFA: "/api/auth/mfa/cancel",
  DISABLE_MFA: "/api/auth/mfa/disable",
  SIGNIN_WITH_MFA: "/api/auth/mfa/signin",
  SESSIONS: "/api/auth/sessions",
  SIGNOUT_OTHERS: "/api/auth/signout/others",
  SIGNOUT_ALL: "/api/auth/signout/all",
};

module.exports = {
  SIGNUP_PAYLOAD,
  ENDPOINTS,
};
