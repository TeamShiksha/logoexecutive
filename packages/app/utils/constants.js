/**
 * @readonly
 * @enum {string}
 **/

const EmailValidationRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY",
};

const TokenExpiry = {
  [UserTokenTypes.VERIFY]: { unit: "day", value: 1 },
  [UserTokenTypes.FORGOT]: { unit: "minute", value: 10 },
};

const UserType = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  OPERATOR: "OPERATOR",
  GUEST: "GUEST",
};

const SubscriptionTypes = {
  HOBBY: "HOBBY",
  PRO: "PRO",
  TEAMS: "TEAMS",
};

const StatusTypes = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  RESOLVED: "RESOLVED",
};

const TAB_OPTIONS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};

const DefaultSubscriptionPlan = {
  type: SubscriptionTypes.HOBBY,
  key_limit: 2,
  usage_limit: 500,
  usage_count: 0,
  is_active: true,
};

const ProSubscriptionPlan = {
  type: SubscriptionTypes.PRO,
  key_limit: 5,
  usage_limit: 15000,
  is_active: true,
};

const Messages = {
  INVALID_USER_ID: "Invalid user id.",
  EMAIL_EXISTS: "Email already exists.",
  EMAIL_DOESNT_EXISTS: "Email doesn't exists.",
  ACCOUNT_DOESNT_EXISTS: "Account does not exist.",
  USER_NOT_FOUND: "User not found.",
  DATA_NOT_FOUND: "User data not found.",
  SOMETHING_WENT_WRONG:
    "We're experiencing high demand. Please try again later.",
  INCORRECT_EMAIL_PASS: "Incorrect email or password.",
  EMAIL_NOT_VERIFIED: "Email not verified",
  SESSION_FAIL: "User session validation failed.",
  INVALID_TOKEN: "Invalid token.",
  EXPIRED_TOKEN: "Token expired.",
  VERIFICATION_FAIL: "Verification failed.",
  EMAIL_ALREADY_VERIFIED:
    "This email has already been verified. You can sign in to your account.",
  PASS_FAILED: "Failed to update password.",
  IMAGE_REQUIRED: "Image not found in request.",
  NAME_AND_EXT_SAME: "Name and extension should be same.",
  UPLOAD_FAILED: "Image upload failed.",
  IMAGE_ALREADY_EXISTS: "Image already exists.",
  UPDATE_IMAGE_FAILED: "Failed to update image record.",
  UPLOAD_SUCCESS: "Image updated successfully.",
  INVALID_KEY: "Invalid API key.",
  LIMIT_REACHED: "Limit reached. Consider upgrading your plan.",
  LOGO_NOT_FOUND: "Logo not found.",
  FETCH_ALL_MESSAGE: "Fetched all contact us messages.",
  MESSAGE_NOT_FOUND: "Message not found.",
  IMAGE_NOT_EXIST: "Image does not exist",
  ALREADY_SEND_RESPOND: "Already sent the response.",
  UPDATE_SUCCESS: "Responded successfully.",
  INCORRECT_PASSWORD: "Current password is incorrect",
  SAME_PASSWORD: "Current password is same as old password",
  INTERNAL_SERVER_ERROR:
    "An unexpected error occurred. Please try again later.",
  FORM_ALREADY_SUBMITTED: "Form already submitted, try again later",
  USER_CREATED: "User created successfully. Please verify your email.",
  EMAIL_REQUIRED: "Email is required",
  NAME_REQUIRED: "Name is required",
  INVALID_EMAIL: "Invalid email",
  UNSUPPORTED_ROLE: "Only admin and operator roles are allowed",
  FORM_SUBMITTED: "Form submitted, our team will get in touch shortly",
  FETCH_ALL_REQUESTS: "Fetched all logo requests",
  LOGO_REQUEST_NOT_FOUND: "Logo request not found",
  LOGO_REQUEST_ALREADY_PROCESSED: "Request already processed",
  LOGO_REQUEST_CREATED: "Logo request created successfully",
  USER_ALREADY_HAS_PENDING: "You already have a pending request.",
  COMPANY_URL_ALREADY_PENDING: "This company url is already under review.",
  TRY_AGAIN: "Try again after 24 hours.",
  FAILED_UPDATE_TOKEN: "Failed to update token.",
  RESEND_EMAIL: "Resent a new Verification Email.",
  RESEND_EMAIL_FAILED: "Failed to resend verification email.",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
  SENT_FORGOT_PASSWORD_EMAIL: "Email sent to reset password.",
  LOGO_ALREADY_CREATED_AND_PENDING:
    "Logo has already been created and is currently pending.",
  CREATED_LOGO_NOT_FOUND: "Created logo not found",
  API_KEY_EXPIRED: "This Key has got expired.",
  UPDATE_API_KEY: "This Key needs an update.",
  MFA_FAILED: "Failed to enable/disable MFA",
  INCORRECT_PIN: "Incorrect pin. Please try again.",
  SUBSCRIPTION_NOT_FOUND: "Subscription not found.",
  PLAN_ALREADY_ACTIVE: "User is already on this plan.",
  PLAN_CHANGE_SUCCESS: "Subscription plan updated successfully.",
  SESSION_NOT_FOUND: "Session not found.",
  CANNOT_REVOKE_CURRENT_SESSION:
    "Cannot revoke current session. Use signout instead.",
  SESSION_LIMIT_EXCEEDED: "Maximum number of active sessions exceeded.",
};

const MAX_SESSIONS_PER_USER = 5;

const ExtractCompanyNameFromUrlRegex = /:\/\/(?:www\.)?([^./]+)\./i;

const CLOUD_FRONT_REGION = "us-east-1";

const getIsProduction = () =>
  process.env.NODE_ENV?.trim().toLowerCase() === "prod";

const USER_SAFE_FIELDS =
  "name email role is_verified subscription_id created_at is_deleted updated_at ";

const SESSION_ID_REGEX = /^[a-f0-9]{128}$/i;

const TEMPORARY_SESSION_TYPES = {
  PASSWORD_RESET: "PASSWORD_RESET",
  MFA: "MFA",
};

module.exports = {
  EmailValidationRegex,
  ExtractCompanyNameFromUrlRegex,
  UserTokenTypes,
  TokenExpiry,
  UserType,
  SubscriptionTypes,
  StatusTypes,
  DefaultSubscriptionPlan,
  ProSubscriptionPlan,
  Messages,
  TAB_OPTIONS,
  CLOUD_FRONT_REGION,
  getIsProduction,
  USER_SAFE_FIELDS,
  SESSION_ID_REGEX,
  TEMPORARY_SESSION_TYPES,
  MAX_SESSIONS_PER_USER,
};
