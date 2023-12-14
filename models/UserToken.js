const { Timestamp, DocumentReference } = require("firebase-admin/firestore");
const { normalizeDate } = require("../utils/date");
const { UserTokenTypes } = require("../utils/constants");
const dayjs = require("dayjs");

class UserToken {
  userId;
  createdAt;
  expireAt;
  token;
  type;

  userTokenRef;

  /**
   * @param {Object} params
   * @param {string} params.token
   * @param {string} params.userId
   * @param {string} params.type
   * @param {Date|Timestamp} params.createdAt
   * @param {Date|Timestamp} params.expireAt
   * @param {DocumentReference} params.userTokenRef
   **/
  constructor(params) {
    this.token = params.token;
    this.userId = params.userId;
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
  static createUserToken(params) {
    const expireAt = params.expireAt ?? dayjs().add(1, "day").toDate();

    return {
      userId: params.userId,
      token: UserToken.newToken,
      type: params.type,
      createdAt: Timestamp.now(),
      expireAt: Timestamp.fromDate(expireAt),
    };
  }

  /**
   * Returns a UserToken collection's token
   **/
  static get newToken() {
    return crypto.randomUUID().replace(/-/g, "");
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

    if (this.type === UserTokenTypes.FORGOT) path = "/auth/change-password";
    if (this.type === UserTokenTypes.VERIFY) path = "/auth/verify";

    const url = new URL(path, process.env.BASE_URL);
    url.searchParams.append("tokenId", this.token);

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
