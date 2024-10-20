const BaseRepository = require("./base.repository");
const Keys = require("../models/Keys");




/**
 * The Keys Repository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Keys model to the base repository for database interactions.
 *  Custom methods specific to Keys can also be added as needed.
*/



class KeysRepository extends BaseRepository {
  constructor() {
    super(Keys);
  }

  async findKeysByUser(userId) {
    return await this.model.find({ user: userId });
  }

}

module.exports = KeysRepository;
