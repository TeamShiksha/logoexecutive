const { Subscriptions } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();

async function refreshUsageCount() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const allSubscriptions = await Subscriptions.find({ usageCount: { $gt: 0 }});
    const recordsToUpdate = [];

    const refreshSubscriptionData = allSubscriptions.map((subscription) => {
      const currentDate = Date.now();
      const daysSinceCreation = Math.round((currentDate - subscription.createdAt) / (1000 * 3600 * 24));

      if (daysSinceCreation > 0 && daysSinceCreation % 30 === 0) {
        recordsToUpdate.push({
          updateOne: {
            filter: { _id: subscription._id },
            update: {
              usageCount: 0,
              updatedAt: currentDate
            }
          }
        });
      }
    });

    if (recordsToUpdate.length > 0) {
      await Subscriptions.bulkWrite(recordsToUpdate);
    }
  } catch(err) {
    console.log(err);
  } finally {
    await mongoose.connection.close();
  }
}

refreshUsageCount().then(() => {
  console.log("Refresh usage count process completed successfully!");
}).catch(err => {
  console.error("An error occurred during the refresh usage count process:", err);
});
