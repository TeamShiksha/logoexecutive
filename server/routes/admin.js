const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/fileUpload"); 
const { adminUploadController } = require("../controllers/admin/admin");

router.post("/upload", authMiddleware, upload.single("logo"), adminUploadController);
module.exports = router;