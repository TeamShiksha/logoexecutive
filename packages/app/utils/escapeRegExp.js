/**
 * Escapes every regular expression metacharacter in a string so it can safely be
 * embedded in a `RegExp` or a mongo `$regex` query built from user input.
 * @param {string} value
 * @returns {string}
 **/
const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { escapeRegExp };
