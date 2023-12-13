const { createImageData } = require("../../../services/Image");
const { storeImageInS3 } = require("./imageProcessingInS3");

const imageProcessing = async (req, res) => {
  try {
    const isImageDataCreated = await createImageData(req);
    if (isImageDataCreated) {
      await storeImageInS3(req, res);
      return res.status(201).json({ message: "Data Inserted in db" });
    }
    return res.status(409).json({ message: "Data already present in db" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

module.exports = imageProcessing;
