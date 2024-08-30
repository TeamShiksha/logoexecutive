const { ContactUs } = require("../models");
const { Images } = require("../models");

/**
 * fetches paginated data
 * @param { string } model - collection name
 * @param { number } page - page number / offset
 * @param { number } limit - limit of data required
 * @param { object } query - limit of data required
 **/

const models = {
  ContactUs,
  Images,
  // please add others if required...
};

async function fetchWithPagination(model, page, limit, query = {}) {
  try {
    const modelName = models[model];
    if (!modelName) {
      throw new Error("This model is not compatible with pagination");
    }

    const skip = (page - 1) * limit;
    const total = await models[model].countDocuments(query);
    const pages = Math.ceil(total / limit);

    const results = await models[model].find(query)
      .skip(skip)
      .limit(limit);

    return {
      total,
      pages,
      page,
      limit,
      results
    };

  } catch (error) {
    throw error;
  }
};

module.exports = fetchWithPagination;
