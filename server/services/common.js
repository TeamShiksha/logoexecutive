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

const fields = "_id message activityStatus createdAt updatedAt";

async function fetchWithPagination(type, page, limit, query = {}) {
  try {
    const modelName = models[type];
    if (!modelName) {
      throw new Error(`Invalid params!${type}`);
    }

    const skip = (page - 1) * limit;
    const total = await models[type].countDocuments(query);
    const pages = Math.ceil(total / limit);

    const q = models[type]
      .find(query)
      .select(fields)
      .skip(skip)
      .limit(limit);
    const results = await q;
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
