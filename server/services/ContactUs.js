const { ContactUs } = require("../models");

/**
 * formExists - Checks if form exists in database by searching for provided email
 * @param {string} email - email submitted in form
 * @returns {boolean} - true when form is found in database else false.
 **/

async function formExists(email) {
  try {
    const formQuery = await ContactUs.findOne({ email, activityStatus: true });
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
      assignedTo: null,
      activityStatus: false,
      reply: null
    });
    const result = await newForm.save();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Updates form in the DB
 * @param {String} formId
 * @param {String} email
 * @param {String} reply
 * @param {String} operatorId
 */

async function updateForm(formId, reply, operatorId) {
  try {
    const currentForm = await ContactUs.findById(formId);
    if (!currentForm) throw new Error("Form not found");
    if (currentForm.activityStatus) {
      return { alreadyReplied: true };
    }

    const result = await ContactUs.updateOne(
      { _id: formId },
      {
        $set: {
          reply,
          activityStatus: true,
          assignedTo: operatorId
        }
      }
    );
    if (result.modifiedCount === 0) throw new Error("MongoDB operation failed");
    return { reply, activityStatus: true, assignedTo: operatorId, email: currentForm.email };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  formExists,
  createForm,
  updateForm
};
