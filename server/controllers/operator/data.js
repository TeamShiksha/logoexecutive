const { STATUS_CODES } = require("http");
const Joi = require("joi");
const { fetchWithPagination } = require("../../services");

const querySchema = Joi.object({
  model: Joi.string().trim().required().messages({
    "string.empty": "Type is required"
  }),
  page: Joi.number().required().messages({
    "number.base": "Page number is required"
  }),
  limit: Joi.number().required().messages({
    "number.base": "Limit number is required"
  }),
  active: Joi.boolean()
});

async function getOperatorDataController(req, res, next) {
  try {
    const { error } = querySchema.validate(req.query);

    if (error)
      return res.status(422).json({
        message: error.message,
        statusCode: 422,
        error: STATUS_CODES[422],
      });

    const { model, page, limit, active } = req.query;

    const paginationData = await fetchWithPagination(model, page, limit, { activityStatus: active });
    if (!paginationData) {
      return res.status(404).json({
        statusCode: 404,
        error: STATUS_CODES[404],
        message: "Data not found!"
      });
    }

    const {
      total,
      pages,
      results
    } = paginationData;

    return res.status(200).json({
      message: "Successful",
      statusCode: 200,
      total,
      pages,
      results
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

module.exports = getOperatorDataController;
