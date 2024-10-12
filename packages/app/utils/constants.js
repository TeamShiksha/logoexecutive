/**
 * @readonly
 * @enum {string}
 **/
const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY"
};
  
const UserType = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  OPERATOR: "OPERATOR"
};
  
const SubscriptionTypes = {
  HOBBY: "HOBBY",
  PRO: "PRO",
  TEAMS: "TEAMS"
};

const ContactUsStatus = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED"
};
  
module.exports = { UserTokenTypes, UserType, SubscriptionTypes, ContactUsStatus };