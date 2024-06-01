/**
 * @readonly
 * @enum {string}
 **/
const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY",
};

const UserType = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
};

const SubscriptionTypes = {
  HOBBY: "HOBBY",
  PRO: "PRO",
  TEAMS: "TEAMS",
};

const config = {
  BUCKET_REGION: process.env.BUCKET_NAME?.split("-").slice(-3).join("-"),
  EMAIL_HOST: "smtp.gmail.com",
  EMAIL_PORT: 587,
  EMAIL_SERVICE: "gmail",
  FIRESTORE_AUTH_PROVIDER: "https://www.googleapis.com/oauth2/v1/certs",
  FIRESTORE_AUTH_URI: "https://accounts.google.com/o/oauth2/auth",
  FIRESTORE_CLIENT_CERT: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-${process.env.FIREBASE_ADMINSDK_ID}%40${process.env.FIRESTORE_PROJECT_ID}.iam.gserviceaccount.com`,
  FIRESTORE_CLIENT_EMAIL: `firebase-adminsdk-${process.env.FIREBASE_ADMINSDK_ID}@${process.env.FIRESTORE_PROJECT_ID}.iam.gserviceaccount.com`,
  FIRESTORE_TOKEN_URI: "https://oauth2.googleapis.com/token",
  KEY: "assets",
  UNIVERSE_DOMAIN: "googleapis.com",
};

module.exports = { UserTokenTypes, UserType, SubscriptionTypes, config };
