const bcrypt = require("bcrypt");
const { UserType } = require("../constants");
const { Timestamp } = require("firebase-admin/firestore");

// 0 - Not verified user
// 1 - Verified user
const mockUsers = [
  {
    userId: "0c1266ab-8ad2-4ab9-b56c-e1db6982f120",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: bcrypt.hashSync("password123", 10), 
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
    userType: UserType.CUSTOMER,
    isVerified: false,
  },
  {
    userId: "9a712ddd-7686-4b3a-9f03-1273ab115e87",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    password: bcrypt.hashSync("password123", 10), 
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
    isVerified: true
  }
];

module.exports = { mockUsers };
