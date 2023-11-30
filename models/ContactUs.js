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
   * @param {string} params.activityStatus
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
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.activityStatus = params.activityStatus;
  }

  /**
   * Get the user data in a structured format.
   * Firebase database methods requires objects not created using "new" keyword
   * @returns {Object} An object containing form data.
   */
  get formData() {
    return {
      name: this.name,
      email: this.email,
      message: this.message,
      assignedTo: this.assignedTo,
      activityStatus: this.activityStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = ContactUs;
