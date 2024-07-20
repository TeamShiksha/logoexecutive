const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  extension: {
    type: String,
    required: true
  },
  domainame: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Static method to create a new image
imageSchema.statics.newImage = function(imageData) {
  const { domainame, uploadedBy, extension } = imageData;
  if (!domainame || !uploadedBy || !extension) {
    return null;
  }
  const image = new this({
    extension,
    domainame,
    uploadedBy,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return image;
};

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
