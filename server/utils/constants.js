/**
 * @readonly
 * @enum {string}
 **/
const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY",
};

const UserType = {
  ADMIN: "admin",
  CUSTOMER:"customer"
};

module.exports = { UserTokenTypes, UserType };
