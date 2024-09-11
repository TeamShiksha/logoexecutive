const { ContactUs } = require("../models");
const { Images } = require("../models");

/**
 * fetches paginated data
 * @param { string } type - collection name
 * @param { number } page - page number / offset
 * @param { number } limit - limit of data required
 * @param { object } query - limit of data required
 **/

const models = {
  queries: ContactUs,
  images: Images,
  // please add others if required...
};

async function fetchWithPagination(type, page, limit, query = {}) {
  try {
    const modelName = models[type];
    if (!modelName) {
      throw new Error("Invalid params!");
    }

    const skip = (page - 1) * limit;
    const total = await models[type].countDocuments(query);
    const pages = Math.ceil(total / limit);

    const results = await models[type].find(query)
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
