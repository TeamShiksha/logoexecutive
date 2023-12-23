const { ContactUsCollection } = require("../utils/firestore");
const ContactUs = require("../models/ContactUs");

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

/**
 * Creates user in the DB
 * @param {Object} formData
 * @param {String} formData.name
 * @param {String} formData.email
 * @param {String} formData.message
 **/
async function createForm(formData){
  try{    
    const {name, email, message} = formData;
    const newForm = await ContactUs.NewForm({
      name,
      email,
      message,
    });
    if (!newForm){
      return null;
    }

    const result = await ContactUsCollection.doc(newForm.contactId).set(newForm);
    if (!result){
      return null;
    }

    const createdForm = new ContactUs(newForm);
    return createdForm;
  }
  catch(error){
    throw error;
  }
}

module.exports = {
  formExists,
  createForm,
};