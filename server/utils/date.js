const { Timestamp } = require("firebase-admin/firestore");

/**
 * Normalizes timestamp input to JS Date format to allow operations and maintain consistency in models
 * @param {Date|Timestamp|string|number} date
 **/
function normalizeDate(date) {
  if (date instanceof Timestamp) return date.toDate();

  if(!Number.isNaN(+date))
    return new Date(date);

  if (!isNaN(Date.parse(date))) return new Date(date);

  return null;
}

module.exports = { normalizeDate };
