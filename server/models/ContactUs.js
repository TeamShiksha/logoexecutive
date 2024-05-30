const {normalizeDate} = require("../utils/date");

class ContactUs {
  email;
  name;
  contactId;
  message;
  activityStatus;
  assignedTo;
  createdAt;
  updatedAt;

  /**
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.contactId
   * @param {string} params.message
   * @param {boolean} params.activityStatus
   * @param {string} params.assignedTo
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   **/
  constructor(params) {
    this.name = params.name;
    this.email = params.email;
    this.contactId = params.contactId;
    this.message = params.message;
    this.assignedTo = params.assignedTo;
    this.createdAt = normalizeDate(params.createdAt);
    this.updatedAt = normalizeDate(params.updatedAt);
    this.activityStatus = params.activityStatus;
  }
}


module.exports = ContactUs;
