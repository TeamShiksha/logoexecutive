const mongoose = require("mongoose");
const { StatusTypes } = require("../utils/constants");

const raiseRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  status: {
    type: String,
    enum: Object.values(StatusTypes),
    default: StatusTypes.PENDING,
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const RaiseRequest = mongoose.model("RaiseRequest", raiseRequestSchema);

module.exports = RaiseRequest;
