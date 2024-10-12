const bcrypt = require("bcryptjs");
const { v4 } = require("uuid");
const mongoose = require("mongoose");

/**
 * Keys Model: Represents API keys associated with user accounts.
 * This model manages the creation, storage, and validation of API keys.
 * It efficient manages and retrieves API key-related information in the application.
*/

const keySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  key: { 
    type: String,
    required: true,
    default: () => v4().replaceAll("-", "").toUpperCase()
  },
  key_description: {
    type: String,
    required: true
  },
  updated_at: { 
    type: Date,
    default: Date.now 
  }
});

keySchema.methods.matchKey = async function(key) {
  return await bcrypt.compare(key, this.key);
};

keySchema.pre("save", async function(next) {
  if (this.isModified("key")) {
    this.key = await bcrypt.hash(this.key, 10);
  }
  next();
});

keySchema.methods.data = function() {
  return {
    _id: this._id,
    user: this.user,
    key_description: this.key_description,
    key: this.key,
    created_at: this._id.getTimestamp(),
    updated_at: this.updated_at,
  };
};

const Keys = mongoose.model("keys", keySchema);

module.exports = Keys;
