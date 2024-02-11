const ContactUs = require("../../models/ContactUs");

const formObj = {
  email: "example@gmail.com",
  name: "first last",
  message: "hasta la vista baby",
  contactId: "123",
  activityStatus: true,
  assignedTo: null,
  createdAt: new Date("01-01-2001"),
  updatedAt: new Date("01-01-2001"),
};

const mockFormModel = new ContactUs(formObj);

module.exports = {
  mockFormModel,
};