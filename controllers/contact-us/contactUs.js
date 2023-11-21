const Joi = require("joi");
const ContactUs = require("../../models/ContactUs");
const {checkFormByEmail} = require("../../services/ContactUs");
const {ContactUsCollection} = require("../../utils/firestore");

/**
 * Joi schema for validating the payload when submitting a contact us form.
 * @typedef {Object} ContactUsPayloadSchema
 * @property {string} name - The name (required, max 50 "alpabet" characters only).
 * @property {string} email - The email address (required, valid email format).
 * @property {string} message - The message (required, max 500 characters).
 */
const contactUsPayloadSchema = Joi.object().keys({
  name: Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^[a-zA-Z ]+$/)
    .message("Name is not valid"),
  
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("Email is not valid"), 

  message: Joi.string()
    .trim()
    .required()
    .max(500),
});


/**
 * Submits a contact us form with the provided payload, only after validating the payload and checking for duplicate form in database
 * @async
 * @function
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} A Promise that resolves once the form submission is complete.
 */

async function submitContactUs(req , res){
  try {   
    const payload = req.body;

    const {error, value} = contactUsPayloadSchema.validate(payload);
    if (error){
      return res
        .status(400)
        .json({
          message: error.message,
          statusCode: 400,
          error: "Invalid Payload"
        });
    }
    const {email} = value;

    const form = await checkFormByEmail(email);
    if (!!form){
      res
        .status(400)
        .json({
          message: "Form is previously submitted. We will contact you soon!",
          statusCode: 400,
          error: "Bad Request"
        });
    }
    else {
      const contactUsDoc= new ContactUs(value);
      const contactUsObject = contactUsDoc.formData;
      const newContactDocRef = await ContactUsCollection.add(contactUsObject);
      const contactId = newContactDocRef.id;
      await newContactDocRef.update({
        contactId: contactId,
      });

      res.status(200).json({
        message: "Form is submitted",
        statusCode: 200
      });
    }

  }catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  submitContactUs,
};