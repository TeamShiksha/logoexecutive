const { Keys } = require("../models");
const { KeyCollection } = require("../utils/firestore");
const { Timestamp } = require("firebase-admin/firestore");
const { v4 } = require("uuid");

async function createKey(data) {
  try {
    const keyData = {
      keyId: v4(),
      userId: data.userId,
      key: v4().replace(/-/g, "").toUpperCase(),
      keyDescription: data.keyDescription,
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await KeyCollection.doc(keyData.keyId).set(keyData);
    const UserKey = new Keys(keyData);
    return UserKey;
  } catch (err) {
    throw err;
  }
}

async function fetchKeysByuserid(userId) {
  try {
    const keyRef = await KeyCollection.where("userId", "==", userId).get();
    if (keyRef.empty) return null;

    const keys = keyRef.docs.map((doc) => new Keys(doc.data()));
    return keys;
  } catch (err) {
    throw err;
  }
}

async function isAPIKeyPresent(apiKey) {
  try {
    const keyRef = await KeyCollection.where("key", "==", apiKey).get();
    if (keyRef.empty) return false;
    return true;
  } catch (err) {
    throw err;
  }
}

async function destroyKey(keyId) {
  try {
    const keyRef = await KeyCollection.doc(keyId).delete();
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createKey,
  fetchKeysByuserid,
  destroyKey,
  isAPIKeyPresent,
};
