const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const { adminUploadController} = require("../controllers/admin");
const { upload} = require("../services");

router.post("/upload", authMiddleware, upload.single("logo"), adminUploadController);
module.exports = router;