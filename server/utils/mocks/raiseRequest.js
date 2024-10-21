const { default: mongoose } = require("mongoose");
const mockRaiseRequestForm = [
  {
    id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
    companyUrl: "https://www.swiggy.com/",
    updatedAt: new Date("01-01-2001"),
  },
  {
    id: new mongoose.Types.ObjectId(),
    user_id: new mongoose.Types.ObjectId("65bd32ab96c587421c08fd47").toString(),
    companyUrl: "https://www.zomato.com/",
    updatedAt: new Date("01-01-2001"),
  },
];

module.exports = { mockRaiseRequestForm };
