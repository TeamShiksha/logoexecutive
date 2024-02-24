const router = require("express").Router();
const addAdminController = require("../controllers/admin/add");
const upload = require("../middlewares/fileUpload");
const { adminUploadController } = require("../controllers/admin/upload");
const authMiddleware = require("../middlewares/auth");

router.put("/add", authMiddleware({ adminOnly: true }), addAdminController);

router.post(
  "/upload",
  authMiddleware({adminOnly: true}),
  upload.single("logo"),
  adminUploadController
);
module.exports = router;
