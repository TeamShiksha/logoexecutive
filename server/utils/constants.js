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
  CUSTOMER: "CUSTOMER",
  OPERATOR: "OPERATOR",
};

const SubscriptionTypes = {
  HOBBY: "HOBBY",
  PRO: "PRO",
  TEAMS: "TEAMS",
};

const StatusTypes = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
};

module.exports = { UserTokenTypes, UserType, SubscriptionTypes, StatusTypes };
