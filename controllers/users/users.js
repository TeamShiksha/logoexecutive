const { fetchUsers } = require("../../services/User");
const serializer = require("../../utils/serializer/serializer");
require("dotenv").config();
const { fetchUserByEmail } = require("../../services/User");
const { updateUserDetails} = require("../../services/User");
const sendEmail  = require('../../utils/sendEmail');

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

async function changeNameEmail(req, res) {
  try {
    const { curr_email } = req.params;
    const { name, email } = req.body;
    const nameArr = name.split(" ");
    const firstName = nameArr[0];
    const lastName = nameArr.slice(1).join(" ");

    const url = `${process.env.BASE_URL}/users/${curr_email}/verify?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`;

    await sendEmail(curr_email, "change email and name", url);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}

async function updateUserNameEmail(req, res) {
  try {
    const { firstName, lastName, email } = req.query;
    const curr_email = req.params.curr_email;

    const user = await fetchUserByEmail(curr_email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await updateUserDetails(curr_email, firstName, lastName, email);
    res.status(200).json({ message: 'API work done successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch or update user', error: error.message });
  }
}

module.exports = {
  getUsers,
  changeNameEmail,
  updateUserNameEmail, 
};
