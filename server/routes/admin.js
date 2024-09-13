const router = require("express").Router();
const addAdminController = require("../controllers/admin/add");
const upload = require("../middlewares/fileUpload");
const { adminUploadController } = require("../controllers/admin/upload");
const { getImagesController } = require("../controllers/admin/data");
const authMiddleware = require("../middlewares/auth");
const { adminReUploadController } = require("../controllers/admin/reupload");


router.put(
  "/add", 
  authMiddleware({ adminOnly: true }), 
  addAdminController
);

router.post(
  "/upload",
  authMiddleware({adminOnly: true}),
  upload.single("logo"),
  adminUploadController
);

router.get(
  "/images",
  authMiddleware({adminOnly: true}),
  getImagesController
);

router.put(
  "/reupload",
  authMiddleware({ adminOnly: true }),
  upload.single("logo"),
  adminReUploadController
);
module.exports = router;
