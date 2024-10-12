const mongoose = require("mongoose");

/**
 * Images Model: Represents image data associated with user-generated content.
 * This model stores information about images uploaded by users.
 * It efficient manages and retrieves image-related information in the application.
*/

const imageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  company_uri: {
    type: String,
    required: true
  },
  image_size: {
    type: Number,
    required: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now
  }
});

imageSchema.methods.data = function() {
  return {
    _id: this._id,
    user_id: this.user_id,
    company_name: this.company_name,
    company_uri: this.company_uri,
    image_size: this.image_size,
    created_at: this._id.getTimestamp(),
    is_deleted: this.is_deleted,
    updated_at: this.updated_at
  }
}

imageSchema.statics.newImage = function(imageData) {
  const { user_id, company_name, company_uri, image_size } = imageData;
  if (!user_id || !company_name || !company_uri || !image_size) {
    return null;
  }
  const image = new this({
    user_id,
    company_name,
    company_uri,
    image_size,
    updated_at: new Date()
  });
  return image;
};

const Image = mongoose.model("images", imageSchema);

module.exports = Image;