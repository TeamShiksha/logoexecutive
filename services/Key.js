const Key = require("../models/Keys");
const { KeyCollection } = require("../utils/firestore");

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
    
    const key = new Key({
      ...keyRef.docs[0].data(),
    });
    return key;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  createKey, fetchKeyByuserid
};