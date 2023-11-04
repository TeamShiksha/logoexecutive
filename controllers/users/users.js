const { fetchUsers } = require("../../services/User");
const serializer = require("../../utils/serializer/serializer");

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

module.exports = {
  getUsers,
};
