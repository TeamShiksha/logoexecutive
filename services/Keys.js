const Key = require("../models/Keys");
const { KeyCollection } = require("../utils/firestore");
const crypto = require("crypto");

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
  
module.exports = {
  createKey
};