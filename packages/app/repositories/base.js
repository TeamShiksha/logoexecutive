/**
 * The BaseRepository serves as a generic repository that provides basic CRUD (Create, Read, Update, Delete) operations for interacting with database.
 * It encapsulates the common database operations for a specific model.
 * It allows to reuse these functionalities across different parts of the application.
*/

class BaseRepository {
    constructor(model) {
      this.model = model;
    }
  
    async getById(id) {
      return this.model.findById(id);
    }

    async getAll(page = 1, limit = 10) {
      const skip = (page - 1) * limit;
      const total = await this.model.countDocuments();
      const data = await this.model.find().skip(skip).limit(limit);
      return {
        data,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    }
 
    async create(data) {
      const document = new this.model(data);
      return document.save();
    }
  
    async update(id, data) {
      return this.model.findByIdAndUpdate(id, data);
    }
  
    async delete(id) {
      return this.model.findByIdAndDelete(id);
    }

    async mark_deleted(id) {
        return this.model.findByIdAndUpdate(id, { isDeleted: true });
      }
  }
  
  module.exports = BaseRepository;
  