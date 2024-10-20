const BaseRepository = require('./base');
const Subscriptions = require('../models/Subscriptions');

/**
 * The SubscriptionsRepository extends BaseRepository to manage ContactUs model operations, inheriting CRUD methods like getById, getAll, create, update, and delete..
 * It passes the Subscriptions model to the base repository for database interactions.
 *  Custom methods specific to Subscriptions can also be added as needed.
*/

class SubscriptionsRepository extends BaseRepository {
  constructor() {
    super(Subscriptions); 
  }

}

module.exports = SubscriptionsRepository;
