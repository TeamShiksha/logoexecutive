
const mockContactUsForm = [
  {
    email: "nonactive@gmail.com",
    name: "first last",
    message: "hasta la vista baby",
    activityStatus: false,
    assignedTo: null,
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
  },
  {
    email: "active@gmail.com",
    name: "first last",
    message: "hasta la vista baby",
    activityStatus: true,
    assignedTo: null,
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
  }
];

module.exports = { mockContactUsForm };
