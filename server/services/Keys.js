const Keys = require("../models/Keys");
const { v4 } = require("uuid");
const mongoose = require("mongoose");

/**
 * Creates Keys in the "Keys" collection
 * @param {Object} data - The parameters for creating the key.
 * @param {string} data.user - user associated with the key
 * @param {string} data.keyDescription - description of the key
 **/
async function createKey(data) {
  try {
    const keyData = {
      user: data.user,
      key: v4().replaceAll("-", "").toUpperCase(),
      keyDescription: data.keyDescription,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const UserKey = new Keys(keyData);
    const result = await UserKey.save();
    if(!result) return null;
    return UserKey;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetches All Keys associated with a userId
 * @param {string} userId - userId associated with the key
 **/
async function fetchKeysByuserid(user) {
  try {
    const keys = await Keys.find({"user": user});
    if (!keys.length) return null;

    return keys;
  } catch (err) {
    throw err;
  }
}

/**
 * Return true if there exists a key with matching key value
 * @param {string} apiKey - key uuid()
 **/
async function isAPIKeyPresent(apiKey) {
  try {
    const keyRef = await Keys.find({"key": apiKey});
    return keyRef.length > 0;
  } catch (err) {
    throw err;
  }
}

/**
 * Deleted the key from mongoDB colletion with matching keyId
 * @param {string} keyId - keyId which is a 24 char hex string (_id)
 **/
async function destroyKey(_id) {
  try {
    const keyRef = await Keys.deleteOne({"_id": _id});
    if(keyRef.deletedCount === 0) throw new Error("Database operation failed");
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
