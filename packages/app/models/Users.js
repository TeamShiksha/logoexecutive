const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserType } = require("../utils/constants");

/**
 * Users Model: Represents user accounts in the application.
 * This model manages user registration, authentication, and profile information.
 * It efficiently manages and retrieves user-related information in the application.
*/

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(UserType),
    default: UserType.CUSTOMER
  },
  is_verified: {
    type: Boolean,
    required: true,
    default: false
  },
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subscriptions",
  },
  keys:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Key",
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now
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
  const { email, name, password } = userData;
  if (!email || !name || !password) {
    return null;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new this({
    email,
    name,
    password: hashedPassword,
    role: UserType.CUSTOMER,
    is_verified: false,
    updated_at: new Date()
  });
  return user;
};

userSchema.methods.data =function(){
  return {
    name: this.name,
    email: this.email,
    role: this.role,
    is_verified: this.is_verified,
    subscription_id: (this.subscription_id).toString(),
    userId: (this._id).toString(),
    created_at: this._id.getTimestamp(),
    is_deleted: this.is_deleted,
    updated_at: this.updated_at
  };
};

const User = mongoose.model("users", userSchema);

module.exports = User;