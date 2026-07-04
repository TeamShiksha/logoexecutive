const BaseRepository = require("./base");
const MilestoneConfig = require("../models/milestoneConfig");

class MilestoneConfigRepository extends BaseRepository {
  constructor() {
    super(MilestoneConfig);
  }

  /**
   * Find the single active, non-deleted config
   * @returns {Promise<Object|null>}
   */
  async findActive({ session } = {}) {
    const q = this.model.findOne({ is_active: true, is_deleted: false });
    if (session) q.session(session);
    return await q.lean();
  }

  /**
   * Get all non-deleted configs, active first
   * @returns {Promise<Array>}
   */
  async findAll() {
    return await this.model
      .find({ is_deleted: false })
      .sort({ is_active: -1, createdAt: -1 })
      .lean();
  }

  /**
   * Find a single non-deleted config by id
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return await this.model.findOne({ _id: id, is_deleted: false }).lean();
  }

  /**
   * Deactivate ALL configs then activate the target.
   * Enforces the "one active at a time" invariant at the DB layer.
   * Uses a MongoDB transaction to ensure atomicity.
   * @param {string} id - Config to activate
   * @returns {Promise<Object>} - The newly activated config
   * @throws {Error} If transaction fails or config not found
   */
  async activateConfig(id) {
    const session = await this.model.startSession();
    return await session.withTransaction(async () => {
      // Deactivate all configs within the transaction
      await this.model.updateMany(
        { is_deleted: false },
        { $set: { is_active: false } },
        { session }
      );

      // Activate the target config within the transaction
      const activated = await this.model.findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: { is_active: true } },
        { new: true, runValidators: true, session }
      );

      return activated;
    });
  }

  /**
   * Update an inactive config's fields
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateInactive(id, data) {
    return await this.model.findOneAndUpdate(
      { _id: id, is_active: false, is_deleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  /**
   * Soft-delete an inactive config
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async softDelete(id) {
    return await this.model.findOneAndUpdate(
      { _id: id, is_active: false, is_deleted: false },
      { $set: { is_deleted: true } },
      { new: true }
    );
  }
}

module.exports = MilestoneConfigRepository;
