const { fetchUsers } = require("../../services/User");
const serializer = require("../../utils/serializer/serializer");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const {fetchUserByEmail} = require("../../services/User");
const {updateUserPassword} = require("../../services/User");

async function getUsers(_, res) {
  try {
    const { data } = await fetchUsers();

    if (!data) {
      return res.status(404).json({
        error: "Not Found",
        statusCode: 404,
        message: "No user found",
      });
    }

    serializer.serialize("users", data, function (err, payload) {
      if (err) {
        return res.status(500).json({
          errors: [
            {
              status: 500,
              detail: err.message,
              title: "Failed to serialize data",
            },
          ],
        });
      }
      return res.status(200).json(payload);
    });
  } catch (err) {
    console.log("Location: getUsers", err);
    throw err;
  }
}

const updatePasswordPayloadSchema = Joi.object().keys({
  email: Joi.string()
    .trim()
    .required()
    .regex(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .message("Email is not valid"),

  currPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(500)
    .message("Current password is not valid"),

  newPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    // atleast one lowercase, one uppercase, one special character, one digit
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]+$/)
    .message("New password does not include atleast one lowercase, uppercase, digit, special character"),

  confirmPassword: Joi.any()
    .required()
    .equal(Joi.ref("newPassword"))
    .messages({
      "any.only": "confirmPassword does not match newPassword",
    }),
});

async function updatePassword(req, res){
  try{
    const payload = req.body;
    const {error, value} = updatePasswordPayloadSchema.validate(payload);
    if (error){
      return res
        .status(422)
        .json({
          message: error.message,
          statusCode: 422,
          error: "Unprocessable payload",
        });
    }

    const {email} = req.body;
    // console.log(email);
    const user = await fetchUserByEmail(email);
    if (!user){
      return res
        .status(400)
        .json({
          message: "Email is incorrect",
          statusCode: 400,
          error: "Bad Request",
        });
    }

    const {currPassword}= req.body;
    // const hashCurrPassword = await bcrypt.hash(currPassword, 10);
    // console.log (hashCurrPassword);
    const matchPassword = await user.matchPassword(currPassword);
    console.log(matchPassword);
    if (!matchPassword){
      return res
        .status(400)
        .json({
          message: "Current Password is incorrect",
          statusCode: 400,
          error: "Bad request",
        });
    }

    const {newPassword} = req.body;
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    const updateStatus = await updateUserPassword(user.id, hashNewPassword);
    if(!updateStatus){
      return res
        .status(500)
        .json({
          message: "Error in updateUser Service",
          statusCode: 500,
          error: "Internal Server Error",
        });
    }
    return updateStatus;
  }
  catch(err){
    console.log("Location: updatePassword controller", err);
    throw err;
  }
}

module.exports = {
  getUsers,
  updatePassword,
};
