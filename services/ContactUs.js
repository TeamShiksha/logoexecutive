const { ContactUsCollection } = require("../utils/firestore");

/**
 * formExists - Checks if form exists in database by searching for provided email
 * @param {string} email - email submitted in form 
 * @returns {boolean} - true when form is found in database else false. 
 **/
async function formExists(email){
  try {
    const formQuery = await ContactUsCollection.where("email", "==", email).limit(1).get();
    if (formQuery.empty){
      return false;
    }
    return true;
  } 
  catch (error){
    throw error;
  }
}

module.exports = {
  formExists,
};