const { Subscriptions } = require("../models");
const mongoose = require("mongoose");
require("dotenv").config();

async function refreshUsageCount() {
  try {
    const recordsToUpdate = [];
    const currentDate = Date.now();
    const milliSecondsaDay = 86400000;
    await mongoose.connect(process.env.MONGO_URL);
    const allSubscriptions = await Subscriptions.find({ usageCount: { $gt: 0 }});
    
    const refreshSubscriptionData = allSubscriptions.map((subscription) => {
      const daysSinceCreation = Math.round((currentDate - subscription.createdAt) / milliSecondsaDay);
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
  console.log("Success");
}).catch(err => {
  console.error("Error occurred", err);
});
