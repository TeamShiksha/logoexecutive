const admin = require("firebase-admin");

if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
  const {
    FIRESTORE_PROJECT_ID,
    FIRESTORE_PRIVATE_KEY,
    FIRESTORE_PRIVATE_ID,
    FIRESTORE_CLIENT_EMAIL,
    FIRESTORE_CLIENT_ID,
    FIRESTORE_TOKEN_URI,
    FIRESTORE_AUTH_PROVIDER,
    FIRESTORE_CLIENT_CERT,
    UNIVERSE_DOMAIN,
    FIRESTORE_AUTH_URI,
  } = process.env;

  admin.initializeApp({
    credential: admin.credential.cert({
        type: "service_account",
        project_id: FIRESTORE_PROJECT_ID,
        private_key_id: FIRESTORE_PRIVATE_ID,
        private_key: FIRESTORE_PRIVATE_KEY,
        client_email: FIRESTORE_CLIENT_EMAIL,
        client_id: FIRESTORE_CLIENT_ID,
        auth_uri: FIRESTORE_AUTH_URI,
        token_uri: FIRESTORE_TOKEN_URI,
        auth_provider_x509_cert_url: FIRESTORE_AUTH_PROVIDER,
        client_x509_cert_url: FIRESTORE_CLIENT_CERT,
        universe_domain: UNIVERSE_DOMAIN,
      },
    ),
  });
} else {
	admin.initializeApp();
}

const db = admin.firestore();

module.exports = { db };
