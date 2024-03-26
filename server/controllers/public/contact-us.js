const Joi = require("joi");
const { STATUS_CODES } = require("http");
const {formExists, createForm} = require("../../services");

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
    .max(500)
    .message("Message is invalid (too long)"),
});

async function contactUsController(req , res, next){
  try {   
    const payload = req.body;

    const {error, value} = contactUsPayloadSchema.validate(payload);
    if (error){
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: STATUS_CODES[422],
        });
    }
    const {email} = value;

    const form = await formExists(email);
    if (!!form){
      return res
        .status(400)
        .json({
          message: "Your form has been previously submitted. Our team will be in touch with you shortly.",
          statusCode: 400,
          error: STATUS_CODES[400],
        });
    }
    const newForm = await createForm(value);
    if (!newForm){
      return res
        .status(500)
        .json({
          message: "Unexpected error while creating form",
          statusCode: 500,
          error: STATUS_CODES[500],
        });
    }

    return res.status(200).json({
      message: "The form has been successfully submitted.",
      statusCode: 200,
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = contactUsController;