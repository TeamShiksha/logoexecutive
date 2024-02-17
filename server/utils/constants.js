/**
 * @readonly
 * @enum {string}
 **/
const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY",
};

const UserType = {
  ADMIN: "ADMIN",
  CUSTOMER:"CUSTOMER"
};

const SubscriptionTypes = {
  HOBBY: "HOBBY",
  PRO: "PRO",
  TEAMS: "TEAMS"
};

module.exports = { UserTokenTypes, UserType, SubscriptionTypes };
