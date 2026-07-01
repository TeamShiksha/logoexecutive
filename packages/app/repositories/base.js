/**
 * The BaseRepository serves as a generic repository that provides basic CRUD (Create, Read, Update, Delete) operations for interacting with database.
 * It encapsulates the common database operations for a specific model.
 * It allows to reuse these functionalities across different parts of the application.
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query, { session } = {}) {
    const q = this.model.find(query);
    if (session) q.session(session);
    return await q;
  }

  async getById(id, { session } = {}) {
    const query = this.model.findById(id).select("-__v");
    if (session) {
      query.session(session);
    }
    return await query;
  }

  async getAll(page = 1, limit = 10, tab = "active") {
    const skip = (page - 1) * limit;
    let filter = {};
    let sort = {};
    if (tab === "active") {
      filter.status = "PENDING";
      sort = { openedAt: 1 }; //old -> new
    } else if (tab === "archived") {
      filter.status = { $in: ["REJECTED", "RESOLVED", "COMPLETED"] };
      sort = { closedAt: -1 }; //new -> old
    }
    const total = await this.model.countDocuments(filter);
    const data = await this.model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data, { session } = {}) {
    const document = new this.model(data);
    if (session) {
      return await document.save({ session });
    }
    return await document.save();
  }

  async update(id, data, { session } = {}) {
    const options = session ? { session } : {};
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async findOneAndUpdate(filter, update, { session } = {}) {
    const options = session ? { session } : {};
    return await this.model.findOneAndUpdate(filter, update, options);
  }

  async delete(id, { session } = {}) {
    const options = session ? { session } : {};
    return await this.model.findByIdAndDelete(id, options);
  }

  async mark_deleted(id, { session } = {}) {
    const options = session ? { session } : {};
    return await this.model.findByIdAndUpdate(id, { isDeleted: true }, options);
  }
}

module.exports = BaseRepository;
