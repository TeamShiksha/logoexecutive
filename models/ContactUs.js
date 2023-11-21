class ContactUs {
  email;
  name;
  message;
  activityStatus;
  createdAt;
  updatedAt;

  constructor(req){
    this.name = req.name;
    this.email = req.email;
    this.message = req.message;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.activityStatus = true;
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
      activityStatus: this.activityStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = ContactUs;