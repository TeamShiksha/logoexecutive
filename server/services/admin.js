const { UserType } = require("../utils/constants");
const { UserCollection } = require("../utils/firestore");

async function setUserAdmin(email) {
  try {
    const userRef = await UserCollection.where("email", "==", email)
      .limit(1)
      .get();
    if (userRef.empty) return null;
    const userType = userRef.docs[0].data().userType;
    if (userType == UserType.ADMIN) {
      return {
        success: true,
        isNewAdmin: false,
      };
    }
    const updatedUser = { userType: UserType.ADMIN };
    const doc = userRef.docs[0];
    await doc.ref.update(updatedUser);
    return {
      success: true,
      isNewAdmin: true,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = { setUserAdmin };
