/**
 * @readonly
 * @enum {string}
 **/
const UserTokenTypes = {
  FORGOT: "FORGOT",
  VERIFY: "VERIFY",
};

const TypesOfUsers = {
  ADMIN: "admin",
  CUSTOMER:"customer"
};

module.exports = { UserTokenTypes, TypesOfUsers };
