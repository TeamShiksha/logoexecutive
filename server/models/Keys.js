const { required } = require("joi");
const { v4 } = require("uuid");
const mongoose = require("mongoose");

const keySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  key: { 
    type: String,
    required: true,
    default: () => v4().replaceAll("-", "").toUpperCase()
  },
  keyDescription: {
    type: String,
    required: true
  },
  usageCount: { 
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: { 
    type: Date,
    default: Date.now 
  }
});

keySchema.methods.data = function() {
  return {
    _id: this._id,
    user: this.user,
    keyDescription: this.keyDescription,
    key: this.key,
    usageCount: this.usageCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Keys = mongoose.model("Keys", keySchema);

module.exports = Keys;

