const bcrypt = require("bcrypt");
const { UserType } = require("../constants");
const { default: mongoose } = require("mongoose");

const mockUsers = [
  {
    _id : new mongoose.Types.ObjectId(),
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
    _id : new mongoose.Types.ObjectId(),
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
    _id : new mongoose.Types.ObjectId(),
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
