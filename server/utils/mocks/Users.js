const bcrypt = require("bcrypt");
const { UserType } = require("../constants");
const { Timestamp } = require("firebase-admin/firestore");

// 0 - Unverified CUSTOMER   
// 1 - Verified CUSTOMER
// 2 - Admin
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
    userType: UserType.CUSTOMER,
    isVerified: true
  },
  {
    userId: "7a9b5ce6-ae35-4fb9-b7f6-bbf85f0536b8",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    password: bcrypt.hashSync("password123", 10), 
    createdAt: Timestamp.fromDate(new Date("01-01-2001")),
    updatedAt: Timestamp.fromDate(new Date("01-01-2001")),
    userType: UserType.ADMIN,
    isVerified: true
  }
];

module.exports = { mockUsers };
