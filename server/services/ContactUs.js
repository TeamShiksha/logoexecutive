const { Timestamp } = require("firebase-admin/firestore");
const { ContactUsCollection } = require("../utils/firestore");
const { ContactUs } = require("../models");
const { v4 } = require("uuid");

/**
 * formExists - Checks if form exists in database by searching for provided email
 * @param {string} email - email submitted in form 
 * @returns {boolean} - true when form is found in database else false. 
 **/
async function formExists(email){
  try {
    const formQuery = await ContactUsCollection.where("email", "==", email).limit(1).get();
    if (formQuery.empty) return false;
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
    const newForm = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      contactId: v4(),
      assignedTo: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      activityStatus: true,
    };
    const result = await ContactUsCollection.doc(newForm.contactId).set(newForm);
    if (!result) return null;
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