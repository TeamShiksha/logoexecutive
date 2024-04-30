const { Timestamp } = require("firebase-admin/firestore");

const mockContactUsForm = [
  {
    email: "nonactive@gmail.com",
    name: "first last",
    message: "hasta la vista baby",
    contactId: "123",
    activityStatus: false,
    assignedTo: null,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  },
  {
    email: "active@gmail.com",
    name: "first last",
    message: "hasta la vista baby",
    contactId: "456",
    activityStatus: true,
    assignedTo: null,
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
  }
];

module.exports = { mockContactUsForm };
