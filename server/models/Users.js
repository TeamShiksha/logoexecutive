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

// Pre-save hook to hash the password before saving
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// Instance method to match password
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateJWT = function() {
  return jwt.sign({ data: this.toJSON() }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Static method to create a new user
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

const User = mongoose.model("User", userSchema);

module.exports = User;