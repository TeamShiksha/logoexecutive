const mongoose = require("mongoose");
const { v4 } = require("uuid");
const dayjs = require("dayjs");
const { UserTokenTypes } = require("../utils/constants");

const userTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    default: () => v4().replaceAll("-", "")
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(UserTokenTypes)
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    required: true,
    default: () => dayjs().add(1, "day").toDate(),
  }
});

userTokenSchema.methods.tokenURL = function() {
  let path,url;
  if (this.type === UserTokenTypes.FORGOT) path = "/reset-password";
  if (this.type === UserTokenTypes.VERIFY) path = "/verify";
  url = new URL(path, process.env.CLIENT_URL);
  url.searchParams.append("token", this.token);
  return url.toString();
};

userTokenSchema.methods.isExpired = function() {
  return !(this.expireAt - Date.now() > 0);
};

userTokenSchema.statics.NewUserToken = function(params) {
  return {
    userId: params.userId,
    token: v4().replaceAll("-", ""),
    type: params.type,
    createdAt: Date.now(),
    expireAt: dayjs().add(1, "day").toDate()
  };
};

const UserToken = mongoose.model("UserToken", userTokenSchema);

module.exports = UserToken;