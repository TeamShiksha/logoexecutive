
const BaseRepository = require('./base');
const Image = require('../models/Images');

/**
 * The ImageRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Images model to the base repository for database interactions.
 *  Custom methods specific to Images can also be added as needed.
*/

class ImagesRepository extends BaseRepository {
  constructor() {
    super(Image); 
  }

  
}

module.exports = ImagesRepository;
