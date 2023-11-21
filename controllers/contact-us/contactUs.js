const Joi = require("joi");
const ContactUs = require("../../models/ContactUs");
const {formExists} = require("../../services/ContactUs");
const {ContactUsCollection} = require("../../utils/firestore");

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

async function submitContactUs(req , res){
  try {   
    const payload = req.body;

    const {error, value} = contactUsPayloadSchema.validate(payload);
    if (error){
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: "Unprocessable payload"
        });
    }
    const {email} = value;

    const form = await formExists(email);
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

  }
  catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  submitContactUs,
};