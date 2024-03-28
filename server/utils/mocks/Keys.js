const { Timestamp } = require("firebase-admin/firestore");

const mockKeys = [
  {
    userId: "0c1266ab-8ad2-4ab9-b56c-e1db6982f120",
    keyId: "e132bdde-e0f4-4f62-88dd-06b06c5f5af0",
    key: "e4f8df44-3761-4b7d-b204-c01471521c27",
    keyDescription: "API-KEY-1",
    usageCount: 200,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  },
];

module.exports = { mockKeys };
