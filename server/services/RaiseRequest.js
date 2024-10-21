const { RaiseRequest } = require("../models");

/**
 * Creates raise request info in the DB
 * @param {Object} formData
 * @param {String} formData.email
 * @param {String} formData.companyUrl
 **/

async function createRaiseRequest(formData) {
  try {
    const newRaiseRequest = new RaiseRequest({
      user_id: formData.user_id,
      companyUrl: formData.companyUrl,
    });
    const result = await newRaiseRequest.save();
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { createRaiseRequest };
