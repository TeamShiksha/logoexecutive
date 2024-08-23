const { Subscriptions } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();

async function refreshUsageCount() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const allSubscriptions = await Subscriptions.find();

    const refreshSubscriptionData = allSubscriptions.map(async (subscription) => {
      const currentDate = Date.now();
      const daysSinceCreation = Math.round((currentDate - subscription.createdAt) / (1000 * 3600 * 24));

      //Every time 30 days i.e a month has passed, usageCount gets reset to zero
      if (daysSinceCreation > 0 && daysSinceCreation % 30 === 0) {
        if(subscription.usageCount > 0) {
          subscription.usageCount = 0;
          subscription.updatedAt = Date.now();
          await subscription.save();
        }
      }
    });

    await Promise.all(refreshSubscriptionData);
  } catch(err) {
    console.log(err);
  } finally {
    await mongoose.connection.close();
  }
}

refreshUsageCount().then(() => {
  console.log("Refresh usage count process completed successfully!");
}).catch(error => {
  console.error("An error occurred during the refresh usage count process:", error);
});
