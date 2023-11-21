const {ContactUsCollection} = require("../utils/firestore");

/**
 * checkFormByEmail - Checks if form exists in database by searching for provided email
 * @param {string} email - email submitted in form 
 * @returns {boolean} - true when form is found in database else false. 
 **/
async function checkFormByEmail(email){
  try {
    const formQuery = await ContactUsCollection.where("email", "==", email)
      .limit(1)
      .get();

    if (formQuery.empty){
      return false;
    }
    else {
      return true;
    }

  } catch (error){
    console.log(error);
  }
}

module.exports = {
  checkFormByEmail,
};