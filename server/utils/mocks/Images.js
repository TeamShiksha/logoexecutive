const { Timestamp } = require("firebase-admin/firestore");


const mockImages = [
  {
    "domainame": "demo1.jpg",
    "imageId": "12579986-7ad0-4a58-b204-211b583ab05b",
    "createdAt": Timestamp.fromDate(new Date("01-01-2001")),
    "updatedAt": Timestamp.fromDate(new Date("01-01-2001")),
  },
  {
    "domainame": "demo2.jpg",
    "imageId": "12579986-7ad0-4a58-b204-211b583ab05b",
    "createdAt": Timestamp.fromDate(new Date("02-02-2002")),
    "updatedAt": Timestamp.fromDate(new Date("02-02-2002")),
  }
];

module.exports = { mockImages };