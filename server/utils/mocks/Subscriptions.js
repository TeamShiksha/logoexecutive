const { Timestamp } = require("firebase-admin/firestore");
const { SubscriptionTypes } = require("../constants");

/**
 * Hobby
 * PRO
 * TEAMS
 **/
const mockSubscriptions = [
  {
    userId: "0c1266ab-8ad2-4ab9-b56c-e1db6982f120",
    subscriptionId: "82524428-4e31-4e72-ad82-370272d1ba3e",
    subscriptionType: SubscriptionTypes.HOBBY,
    keyLimit: 2,
    isActive: true,
    usageLimit: 5000,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  },
  {
    userId: "9a712ddd-7686-4b3a-9f03-1273ab115e87",
    subscriptionId: "dc5ea89f-5fd9-49b4-bc82-012babdc2ba1",
    subscriptionType: SubscriptionTypes.PRO,
    keyLimit: 5,
    isActive: true,
    usageLimit: 15000,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  },
  {
    userId: "f360d717-7482-4442-9a34-b457ba9cb6f9",
    subscriptionId: "c3933096-a741-4e97-a6d8-3bbf32fe3b01",
    subscriptionType: SubscriptionTypes.TEAMS,
    keyLimit: 10,
    isActive: true,
    usageLimit: 50000,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  },
];

module.exports = { mockSubscriptions };
