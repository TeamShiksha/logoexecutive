const BaseRepository = require('./base');
const UserToken = require('../models/UserToken');

/**
 * The UserTokenRepository extends BaseRepository to manage UerToken model operations,
 * inheriting CRUD methods like getById, getAll, create, update, and delete.
 * It passes the UserToken model to the base repository for database interactions.
 *  Custom methods specific to UserToken can also be added as needed.
*/

class UserTokenRepository extends BaseRepository{
    constructor() {
        super(UserToken); 
      }
      
}

module.exports = UserTokenRepository;
