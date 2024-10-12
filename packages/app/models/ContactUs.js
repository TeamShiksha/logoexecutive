const mongoose = require("mongoose");

/**
 * ContactUs Model: Represents user inquiries and support requests.
 * This model stores contact form submissions, allowing for efficient
 * management of customer service and issue tracking.
*/

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
  status: {
    type: String,
    enum: Object.values(ContactUsStatus),
    default: ContactUsStatus.PENDING
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  comment: {
    type: String,
    required: false,
    trim: true
  }
});

contactUsSchema.methods.data  = function() {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    message: this.message,
    status: this.status,
    operator: this.operator,
    created_at: this._id.getTimestamp(),
    is_deleted: this.is_deleted,
    updated_at: this.updated_at
  }
}

const ContactUs = mongoose.model("contactus", contactUsSchema);

module.exports = ContactUs;