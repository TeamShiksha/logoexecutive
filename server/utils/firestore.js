const admin = require("firebase-admin");
const { config } = require("./constants");

const serviceAccountDetails = {
  type: "service_account",
  project_id: process.env.FIRESTORE_PROJECT_ID,
  private_key_id: process.env.FIRESTORE_PRIVATE_ID,
  private_key: process.env.FIRESTORE_PRIVATE_KEY
    ? process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/gm, "\n")
    : undefined,
  client_email: config.FIRESTORE_CLIENT_EMAIL,
  client_id: process.env.FIRESTORE_CLIENT_ID,
  auth_uri: config.FIRESTORE_AUTH_URI,
  token_uri: config.FIRESTORE_TOKEN_URI,
  auth_provider_x509_cert_url: config.FIRESTORE_AUTH_PROVIDER,
  client_x509_cert_url: config.FIRESTORE_CLIENT_CERT,
  universe_domain: config.UNIVERSE_DOMAIN,
};

if (process.env.NODE_ENV === "test" || +process.env.EMULATED_FIRESTORE) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  admin.initializeApp({
    projectId: process.env.FIRESTORE_PROJECT_ID,
  });
} else {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountDetails),
  });
}

const db = admin.firestore();
const UserCollection = db.collection("Users");
const ContactUsCollection = db.collection("Contact-us");
const KeyCollection = db.collection("keys");
const SubscriptionCollection = db.collection("Subscriptions");
const ImageCollection = db.collection("Images");
const UserTokenCollection = db.collection("UserTokens");

module.exports = {
  db,
  UserTokenCollection,
  UserCollection,
  ContactUsCollection,
  KeyCollection,
  SubscriptionCollection,
  ImageCollection,
};
