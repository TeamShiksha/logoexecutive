const { Timestamp, DocumentReference } = require("firebase-admin/firestore");
const { normalizeDate } = require("../utils/date");
const { UserTokenTypes } = require("../utils/constants");
const { v4 } = require("uuid");
const dayjs = require("dayjs");

class UserToken {
  createdAt;
  expireAt;
  token;
  type;
  userId;
  userTokenId;
  userTokenRef;

  /**
   * @param {Object} params
   * @param {string} params.token
   * @param {string} params.userId
   * @param {string} params.userTokenId
   * @param {string} params.type
   * @param {Date|Timestamp} params.createdAt
   * @param {Date|Timestamp} params.expireAt
   * @param {DocumentReference} params.userTokenRef
   **/
  constructor(params) {
    this.token = params.token;
    this.userId = params.userId;
    this.userTokenId = params.userTokenId;
    this.type = params.type;
    this.createdAt = normalizeDate(params.createdAt);
    this.expireAt = normalizeDate(params.expireAt);
    this.userTokenRef = params.userTokenRef;
  }

  /**
   * Creates a firebase compatible userToken
   * @param {Object} params
   * @param {string} params.userId - userId for the token is being created
   * @param {UserTokenTypes} params.type
   * @param {Date} [params.expireAt] - expiry date of token (Default value is 24 hours after creation)
   **/
  static NewUserToken(params) {
    const expireAt = params.expireAt
      ? normalizeDate(params.expireAt)
      : dayjs().add(1, "day").toDate();
    return {
      userId: params.userId,
      token: v4().replaceAll("-", ""),
      userTokenId: v4(),
      type: params.type,
      createdAt: Timestamp.now(),
      expireAt: Timestamp.fromDate(expireAt),
    };
  }

  /**
   * Generates a link that can be shared via email
   *
   * @param {UserTokenTypes} path - path of service
   */
  get tokenURL() {
    let path, url;
    if (this.type === UserTokenTypes.FORGOT) path = "/reset-password";
    if (this.type === UserTokenTypes.VERIFY) path = "/verify";
    url = new URL(path, process.env.CLIENT_URL);
    url.searchParams.append("token", this.token);
    return url;
  }

  /**
   * returns - true if token is expired and false if not
   **/
  isExpired() {
    return !(this.expireAt - Date.now() > 0);
  }
}

module.exports = UserToken;
