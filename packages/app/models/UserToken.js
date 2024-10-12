const mongoose = require("mongoose");
const { v4 } = require("uuid");
const dayjs = require("dayjs");
const { UserTokenTypes } = require("../utils/constants");

/**
 * UserToken Model: Represents user tokens used for authentication and password reset.
 * This model stores tokens for user authentication and password reset processes.
 * It manages token-related information in the application.
*/

const userTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    default: () => v4().replaceAll("-", "")
  },
  user_id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(UserTokenTypes)
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  expire_at: {
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
  return !(this.expire_at - Date.now() > 0);
};

userTokenSchema.statics.NewUserToken = function(params) {
  return new this({
    user_id: params.userId,
    token: v4().replaceAll("-", ""),
    type: params.type,
  });
};

const UserToken = mongoose.model("usertokens", userTokenSchema);

module.exports = UserToken;