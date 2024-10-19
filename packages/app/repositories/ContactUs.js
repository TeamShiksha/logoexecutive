
const BaseRepository = require('./base');
const ContactUs = require('../models/ContactUs'); 

/**
 * The ContactUsRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the ContactUs model to the base repository for database interactions.
 *  Custom methods specific to ContactUs can also be added as needed.
*/

class ContactUsRepository extends BaseRepository {
  constructor() {
    super(ContactUs); 
  }
  
}

module.exports = ContactUsRepository;
