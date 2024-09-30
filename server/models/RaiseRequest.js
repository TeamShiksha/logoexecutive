const mongoose = require("mongoose");

const raiseRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "{VALUE} is not a valid email!"],
  },
  companyUrl: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d+)?(\/.*)?$/,
      "Please enter a valid URL.",
    ],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const RaiseRequest = mongoose.model("RaiseRequest", raiseRequestSchema);

module.exports = RaiseRequest;
