const bcrypt = require("bcrypt");
const { UserType } = require("../constants");

const mockUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: bcrypt.hashSync("password123", 10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userType: UserType.CUSTOMER,
    isVerified: false,
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    password: bcrypt.hashSync("password123", 10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userType: UserType.CUSTOMER,
    isVerified: true,
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "johndoe2@example.com",
    password: bcrypt.hashSync("password123", 10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userType: UserType.ADMIN,
    isVerified: true,
  },
];

module.exports = { mockUsers };
