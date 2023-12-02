class UserTokens{
  tokenId;
  userId;
  #token;
  expiry;
  type;
  createdAt;

  constructor(params) {
    this.tokenId = params.tokenId;
    this.userId = params.userId;
    this.type = params.type;
    this.createdAt = params.createdAt;
    this.#token = params.token || null;
    this.expiry = params.expiry;
  }
}

module.exports = UserTokens;