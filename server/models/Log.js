const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  log_message: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  request_ip: {
    type: String,
  },
  host: {
    type: String,
  },
  status: {
    type: String,
  },
  request: {
    type: String,
  },
});

const Log = mongoose.model("Log", LogSchema);

module.exports = Log;
