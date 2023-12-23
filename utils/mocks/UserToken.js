const UserToken = require("../../models/UserToken");
const { UserTokenTypes } = require("../constants");
const { mockUserModel } = require("./Users");

const mockUserTokenVerify = new UserToken(UserToken.createUserToken({userId: mockUserModel.userId, type: UserTokenTypes.VERIFY}));

module.exports = { mockUserTokenVerify };
