const { fetchUsers } = require("../../services/User");
const serializer = require("../../utils/serializer/serializer");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const {fetchUserByEmail} = require("../../services/User");
const {UserCollection} = require("../../utils/firestore");

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
  currPassword: Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
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
    const {payload} = req.body;
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

    const {currPassword} = req.body.payload;
    const {email} = req.body.userData;
    const user = await fetchUserByEmail(email);

    const matchPassword = await user.matchPassword(currPassword);
    if (!matchPassword){
      return res
        .status(400)
        .json({
          message: "Current Password is incorrect",
          statusCode: 400,
          error: "Bad request",
        });
    }

    const {newPassword} = req.body.payload;
    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    const {id} = req.body.userData;

    // userDocRef is a pointer to the location where the document with the specified userId would be if it existed. 
    // If the document doesn't exist, the reference still points to that theoretical location.
    const userDocRef = UserCollection.doc(id);
    const userDoc = await userDocRef.get();

    // When user is not found in database .get() still returns a snapshot but userDoc.exists property is set to false
    if (!userDoc.exists){
      return res
        .status(404)
        .json({
          message:"User not found in database",
          statusCode: 404,
          error: "Not found",
        });
    }
    else {
      await userDocRef.update({
        password: hashNewPassword,
      });

      return res
        .status(200)
        .json({
          message:"Password updated successfully!"
        });
    }
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
