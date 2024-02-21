const { Timestamp } = require("firebase-admin/firestore");

// Generic form
const mockContactUsForm = [
  {
    email: "example@gmail.com",
    name: "first last",
    message: "hasta la vista baby",
    contactId: "123",
    activityStatus: true,
    assignedTo: null,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  }
];

module.exports = { mockContactUsForm };
