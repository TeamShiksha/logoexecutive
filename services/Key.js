const Key = require("../models/Keys");
const { KeyCollection } = require("../utils/firestore");
const {Timestamp} = require("firebase-admin/firestore");

async function createKey(data) {
  try {
    const keyData = {
      keyId: crypto.randomUUID(),
      userId: data.userId,
      key: crypto.randomUUID().replace(/-/g, "").toUpperCase(),
      keyDescription: data.keyDescription,
      usageCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const result = await KeyCollection.add(keyData);
    const UserKey = new Key(keyData);
    return UserKey;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function fetchKeyByuserid(userId) {
  try {
    const keyRef = await KeyCollection.where("userId", "==", userId).get();
    if (keyRef.empty) {
      return null;
    }
    const keysObject = keyRef.docs.map(doc => new Key({
      ...doc.data(),
    }));
    return keysObject;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * Fetches the document reference and data for a specific key ID.
 * @param {string} keyId - The ID of the key to fetch.
 */
async function getKeyDocumentRef(keyId) {
  try {
    const keyRef = await KeyCollection.where("keyId", "==", keyId).get();
    if (keyRef.empty) {
      return null;
    }
    const keysObject = keyRef.docs.map(doc => new Key({
      ...doc.data(),
    }));
    
    const keyDocumentRef= keyRef.docs[0].ref;
    return {keysObject, keyDocumentRef};
  } catch (err) {
    console.log(err);
    throw err;
  }
}

/**
 * Deletes a key by document reference.
 * @param {Object} keyDocumentRef - The document reference of the key to delete.
 */

async function deleteKey(keyDocumentRef) {
  try {
    await keyDocumentRef.delete();
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  createKey,
  fetchKeyByuserid,
  getKeyDocumentRef,
  deleteKey,
};
