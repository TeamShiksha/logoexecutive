const { UserType } = require("../utils/constants");
const { UserCollection } = require("../utils/firestore");

async function setUserAdmin(email) {
  try{
    const userRef = await UserCollection.where("email", "==", email).limit(1).get();
    if (userRef.empty) return null;
    const userType = userRef.docs[0].data().userType;
    if (userType == UserType.ADMIN) {
      return {
              statusCode: 204,
              message: `User ${email} is already an admin`
            };
    }
    const updatedUser = { userType : UserType.ADMIN };
    const doc = userRef.docs[0];
    await doc.ref.update(updatedUser);
    return {
            statusCode: 200,
            message: `User ${email} is now an admin`
          };
  }
  catch(err){
    console.log(err);
    throw err;
  }
}

module.exports = { setUserAdmin };