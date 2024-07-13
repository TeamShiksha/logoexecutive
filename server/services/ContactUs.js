const { ContactUs } = require("../models");

/**
 * formExists - Checks if form exists in database by searching for provided email
 * @param {string} email - email submitted in form 
 * @returns {boolean} - true when form is found in database else false. 
 **/
async function formExists(email) {
  try {
    const formQuery = await ContactUs.findOne({ email, activityStatus:true });
    if (!formQuery) return false;
    return true;
  } catch (error) {
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
async function createForm(formData) {
  try {
    const newForm = new ContactUs({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      assignedTo:null,
      activityStatus: true,
    });
    const result = await newForm.save();
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  formExists,
  createForm,
};
