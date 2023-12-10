const User = require("../../models/Users");

const userObj = {
  userId: "123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "john@doe",
  createdAt: new Date("01-01-2001"),
  updatedAt: new Date("01-01-2001")
};

const mockUserModel = new User(userObj);

module.exports = { mockUserModel };
