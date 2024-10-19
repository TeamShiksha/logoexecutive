
const BaseRepository = require('./base');
const User = require('../models/User'); 

/**
 * The UsersRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Users model to the base repository for database interactions.
 *  Custom methods specific to Users can also be added as needed.
*/

class UsersRepository extends BaseRepository {
  constructor() {
    super(User); 
  }


}

module.exports = UsersRepository;
