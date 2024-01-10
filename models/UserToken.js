const { Timestamp, DocumentReference } = require("firebase-admin/firestore");
const { normalizeDate } = require("../utils/date");
const { UserTokenTypes } = require("../utils/constants");

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
   * Returns normalized data that can be used in JS
   **/
  get data() {
    return {
      userId: this.userId,
      token: this.token,
      createdAt: new Date(this.createdAt),
      expireAt: new Date(this.expireAt),
    };
  }

  /**
   * Generates a link that can be shared via email
   *
   * @param {UserTokenTypes} path - path of service
   */
  get tokenURL() {
    let path;
    if (this.type === UserTokenTypes.FORGOT) path = "/auth/reset-password";
    if (this.type === UserTokenTypes.VERIFY) path = "/auth/verify";
    const url = new URL(path, process.env.BASE_URL);
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
