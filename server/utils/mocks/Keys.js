const mongoose = require("mongoose");

const mockKeys = [
  {
    user: new mongoose.Types.ObjectId("DCFFDBC27D679F85E0289E78"),
    key: "15C557FB641A43A96E5A3C19",
    keyDescription: "API-KEY-1",
    usageCount: 200,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

module.exports = { mockKeys };
