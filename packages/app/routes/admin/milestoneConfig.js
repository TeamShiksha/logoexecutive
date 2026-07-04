const router = require("express").Router();
const auth = require("../../middlewares/auth");
const {
  listMilestoneConfigsController,
  getMilestoneConfigController,
  createMilestoneConfigController,
  activateMilestoneConfigController,
  updateMilestoneConfigController,
  deleteMilestoneConfigController,
} = require("../../controllers/milestoneConfig");

router.use(auth({ adminOnly: true }));

/**
 * GET /api/admin/milestones
 * List all configs (active first)
 */
router.get("/", listMilestoneConfigsController);

/**
 * GET /api/admin/milestones/:id
 * Get a single config by id
 */
router.get("/:id", getMilestoneConfigController);

/**
 * POST /api/admin/milestones
 * Create a new config (inactive by default)
 */
router.post("/", createMilestoneConfigController);

/**
 * PATCH /api/admin/milestones/:id/activate
 * Activate this config; deactivates all others
 */
router.patch("/:id/activate", activateMilestoneConfigController);

/**
 * PATCH /api/admin/milestones/:id
 * Edit an inactive config (active configs are read-only)
 */
router.patch("/:id", updateMilestoneConfigController);

/**
 * DELETE /api/admin/milestones/:id
 * Soft-delete an inactive config
 */
router.delete("/:id", deleteMilestoneConfigController);

module.exports = router;
