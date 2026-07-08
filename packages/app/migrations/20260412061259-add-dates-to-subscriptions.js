module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    try {
      console.log("=== MIGRATION START ===");

      // List all collections
      const collections = await db.listCollections().toArray();
      console.log(
        "All collections:",
        collections.map((c) => c.name)
      );

      // Count documents
      const count = await db.collection("subscriptions").countDocuments({});
      console.log(`Total subscriptions: ${count}`);

      if (count === 0) {
        console.log("⚠️ No documents found in subscriptions collection!");
        return;
      }

      // Try the update
      const result = await db
        .collection("subscriptions")
        .updateMany({}, { $set: { startDate: new Date(), endDate: null } });

      console.log(`✅ Updated ${result.modifiedCount} documents`);
      console.log(`Matched: ${result.matchedCount}`);
    } catch (error) {
      console.error("❌ Migration error:", error.message);
      throw error;
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db
      .collection("subscriptions")
      .updateMany({}, { $unset: { startDate: "", endDate: "" } });
  },
};
