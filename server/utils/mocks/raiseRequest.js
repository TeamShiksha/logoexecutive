const { default: mongoose } = require("mongoose");
const mockRaiseRequestForm = [
  {
    id: new mongoose.Types.ObjectId(),
    email: "adityak842@gmail.com",
    companyUrl: "https://www.swiggy.com/",
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
  },
  {
    id: new mongoose.Types.ObjectId(),
    email: "dummy32@gmail.com",
    companyUrl: "https://www.zomato.com/",
    createdAt: new Date("01-01-2001"),
    updatedAt: new Date("01-01-2001"),
  },
];

module.exports = { mockRaiseRequestForm };
