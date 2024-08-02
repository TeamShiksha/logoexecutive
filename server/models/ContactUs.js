const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  activityStatus: {
    type: Boolean,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
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
  }
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;