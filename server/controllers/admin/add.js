const Joi = require("joi");
const { STATUS_CODES } = require("http");
const { setUserAdmin } = require("../../services/AddAdmin");

const addAdminSchema = Joi.object().keys({
  "new_admin_email": Joi.string()
    .trim()
    .required()
    .max(50)
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("Email must be a valid email address")
});

const addAdminController = async (req, res, next) => {
  try{
    const email = req.body.new_admin_email;
    const { error } = addAdminSchema.validate(req.body);

    if (error) {
      return res.status(422).json({
        status: 422,
        message: error.details[0].message,
        error: STATUS_CODES[422],
      });
    }

    const message = await setUserAdmin(email);

    if (!message) {
      return res.status(404).json({
        status: 404,
        error: STATUS_CODES[404],
        message: "User not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: message
    });

  }
    
  catch(err){
    next(err);
  }

};

module.exports = addAdminController;