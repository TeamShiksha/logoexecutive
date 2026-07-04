/**
 * processRewards.js — Standalone reward worker
 *
 * Executed by the scheduled GitHub Actions workflow (process-rewards.yml).
 * Safe to re-run at any time: all logic is idempotent.
 *
 * Flow:
 *  1. Connect to MongoDB via MONGO_URL
 *  2. Read the single active MilestoneConfig — abort if none
 *  3. Find all Images where has_pending_reward = true
 *  4. Call RewardsService.processRewardsForImage() for each
 *  5. Print summary and exit 0 (or exit 1 on fatal error)
 */

"use strict";

const mongoose = require("mongoose");
const MilestoneConfigRepository = require("../../repositories/milestoneConfig");
const ImagesRepository = require("../../repositories/images");
const RewardsService = require("../../services/rewards");

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error(
    "[worker] MONGO_URL environment variable is not set. Aborting."
  );
  process.exit(1);
}

async function main() {
  // ── 1. Connect ────────────────────────────────────────────────────────────
  await mongoose.connect(MONGO_URL);
  console.log("[worker] Connected to MongoDB");

  // ── 2. Verify active MilestoneConfig exists ───────────────────────────────
  const milestoneConfigRepo = new MilestoneConfigRepository();
  const activeConfig = await milestoneConfigRepo.findActive();

  if (!activeConfig) {
    console.error("[worker] No active MilestoneConfig found. Aborting.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(
    `[worker] Active config: "${activeConfig.name}" — ${activeConfig.thresholds.length} threshold(s)`
  );

  // ── 3. Find pending images ────────────────────────────────────────────────
  const imagesRepo = new ImagesRepository();
  const pendingImages = await imagesRepo.find({ has_pending_reward: true });

  console.log(`[worker] Found ${pendingImages.length} image(s) to process`);

  if (pendingImages.length === 0) {
    console.log("[worker] Nothing to do. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── 4. Process each image ─────────────────────────────────────────────────
  const rewardsService = new RewardsService();

  let successCount = 0;
  let failureCount = 0;
  let totalPointsAwarded = 0;

  for (const image of pendingImages) {
    const imageId = image._id.toString();
    try {
      const result = await rewardsService.processRewardsForImage(image._id);

      if (result.success) {
        successCount++;
        totalPointsAwarded += result.totalPointsAwarded || 0;
        console.log(
          `[worker] ✓ ${imageId} — +${result.totalPointsAwarded ?? 0} pts` +
            (result.newMilestones?.length
              ? ` (${result.newMilestones.length} milestone(s))`
              : "")
        );
      } else {
        failureCount++;
        console.error(`[worker] ✗ ${imageId} — ${result.error}`);
      }
    } catch (err) {
      failureCount++;
      console.error(`[worker] ✗ ${imageId} — unexpected error:`, err.message);
    }
  }

  // ── 5. Summary ────────────────────────────────────────────────────────────
  console.log(
    `[worker] Done — processed=${pendingImages.length}, ` +
      `success=${successCount}, failed=${failureCount}, ` +
      `totalPoints=${totalPointsAwarded}`
  );

  await mongoose.disconnect();

  if (failureCount > 0) {
    // Exit 1 so the GH Actions step is marked as failed
    process.exit(1);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
