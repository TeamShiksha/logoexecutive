const router = require("express").Router();
const authMiddleware = require("../middlewares/auth");

const {
  signupController,
  signinController,
  signoutController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordSessionController,
  resetPasswordController,
  validateSessionController,
  siginWithMFAController,
  enableMFAController,
  verifyMFAController,
  cancelMFAController,
  disableMFAController,
  mfaStatusController,
  listSessionsController,
  revokeSessionController,
  signoutOthersController,
  signoutAllController,
} = require("../controllers/auth");

router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.get("/verify/:token?", verifyEmailController);
router.post("/password/forgot", forgotPasswordController);
router.get("/password/forgot/:token?", resetPasswordSessionController);
router.patch("/password/reset", resetPasswordController);
router.get("/validate-session", authMiddleware(), validateSessionController);
router.post("/mfa/signin", siginWithMFAController);
router.post("/mfa/enable", authMiddleware(), enableMFAController);
router.post("/mfa/verify", authMiddleware(), verifyMFAController);
router.post("/mfa/cancel", authMiddleware(), cancelMFAController);
router.post("/mfa/disable", authMiddleware(), disableMFAController);
router.get("/mfa/status", authMiddleware(), mfaStatusController);

router.get("/sessions", authMiddleware(), listSessionsController);
router.delete(
  "/sessions/:sessionId",
  authMiddleware(),
  revokeSessionController
);
router.post("/signout/others", authMiddleware(), signoutOthersController);
router.post("/signout/all", authMiddleware(), signoutAllController);

module.exports = router;
