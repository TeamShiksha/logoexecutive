const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserType } = require("../utils/constants");
const dayjs = require("dayjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: Object.values(UserType),
    default: UserType.CUSTOMER
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  }
});


userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function() {
  return jwt.sign({ data: this.data() }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

userSchema.statics.NewUser = async function(userData) {
  try {
    const { email, firstName, lastName, password } = userData;
    if (!email || !firstName || !lastName || !password) {
      return null;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      userType: UserType.CUSTOMER,
      isVerified: false,
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate()
    });
    return user;
  } catch (err) {
    throw err;
  }
};

userSchema.methods.data =function(){
  return {
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    userId: (this._id).toString(),
    userType: this.userType,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;