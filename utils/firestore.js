const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountKey = "serviceAccountKey.json";
let serviceAccountdetails;

if (fs.existsSync(serviceAccountKey)){
  serviceAccountdetails = require("../" + serviceAccountKey);
} else if (process.env.FIRESTORE_PROJECT_ID && process.env.FIRESTORE_PRIVATE_KEY && process.env.FIRESTORE_PRIVATE_ID && process.env.FIRESTORE_CLIENT_EMAIL && 
  process.env.FIRESTORE_CLIENT_ID && process.env.FIRESTORE_TOKEN_URI && process.env.FIRESTORE_AUTH_PROVIDER && process.env.FIRESTORE_CLIENT_CERT &&
  process.env.UNIVERSE_DOMAIN && process.env.FIRESTORE_AUTH_URI) {
  serviceAccountdetails = {
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
} else{
  throw new Error("serviceAccountKey.json or environmental variables must be present for Firebase connection.");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountdetails)
});
const db = admin.firestore();

module.exports = { db };