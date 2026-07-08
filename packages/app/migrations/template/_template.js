// HOW TO CREATE A NEW MIGRATION:
// 1. Run: npx migrate-mongo create <descriptive-name>
//    Example: npx migrate-mongo create add-phone-to-users
// 2. Fill in the up() and down() functions below
// 3. Run locally first: npm run migrate:up
// 4. Commit the migration file and your model change together
// 5. Push — Vercel will run the migration automatically on deploy
// ─────────────────────────────────────────────────────────────
/* eslint-disable no-undef */
module.exports = {
  async up(db) {
    // WHAT TO DO HERE:
    // - Add new fields to existing documents
    // - Always filter with $exists: false so it's safe to re-run
    // - Log how many documents were affected

    const result = await db.collection("COLLECTION_NAME").updateMany(
      { NEW_FIELD: { $exists: false } }, // only touch docs missing the field
      { $set: { NEW_FIELD: DEFAULT_VALUE } }
    );

    console.log(`Migration up: updated ${result.modifiedCount} documents`);
  },

  async down(db) {
    // WHAT TO DO HERE:
    // - Undo exactly what up() did.
    // - This runs when someone does: npm run migrate:down

    await db
      .collection("COLLECTION_NAME")
      .updateMany({}, { $unset: { NEW_FIELD: "" } });

    console.log("Migration down: removed NEW_FIELD from COLLECTION_NAME");
  },
};
