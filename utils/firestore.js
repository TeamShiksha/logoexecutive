const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccountDetails;
const serviceKeyPath = path.join(process.cwd(), "serviceAccountKey.json");
const serviceAccountKeyExists = fs.existsSync(serviceKeyPath);

if (serviceAccountKeyExists)
  serviceAccountDetails = require(serviceKeyPath);
else {
  serviceAccountDetails = {
    type: "service_account",
    project_id: process.env.FIRESTORE_PROJECT_ID,
    private_key_id: process.env.FIRESTORE_PRIVATE_ID,
    private_key: process.env.FIRESTORE_PRIVATE_KEY,
    client_email: process.env.FIRESTORE_CLIENT_EMAIL,
    client_id: process.env.FIRESTORE_CLIENT_ID,
    auth_uri: process.env.FIRESTORE_AUTH_URI,
    token_uri: process.env.FIRESTORE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIRESTORE_AUTH_PROVIDER,
    client_x509_cert_url: process.env.FIRESTORE_CLIENT_CERT,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  };
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountDetails),
});

const db = admin.firestore();

module.exports = { db };
