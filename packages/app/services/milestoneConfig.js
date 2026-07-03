const { MilestoneConfigRepository } = require("../repositories");

class MilestoneConfigService {
  constructor() {
    this.milestoneConfigRepository = new MilestoneConfigRepository();
  }

  /**
   * Get all non-deleted configs (active first)
   * @returns {Promise<Array>}
   */
  async getAllConfigs() {
    return await this.milestoneConfigRepository.findAll();
  }

  /**
   * Get a single config by id
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getConfigById(id) {
    return await this.milestoneConfigRepository.findById(id);
  }

  /**
   * Get the currently active config
   * @returns {Promise<Object|null>}
   */
  async getActiveConfig() {
    return await this.milestoneConfigRepository.findActive();
  }

  /**
   * Create a new milestone config (inactive by default)
   * @param {Object} data - { name, thresholds: [{at, points}] }
   * @param {string} adminId - Creator's user id
   * @returns {Promise<Object>}
   */
  async createConfig(data, adminId) {
    const { name, thresholds } = data;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new Error("name is required");
    }

    this._validateThresholds(thresholds);

    return await this.milestoneConfigRepository.create({
      name: name.trim(),
      thresholds,
      is_active: false,
      created_by: adminId,
    });
  }

  /**
   * Activate a config. Deactivates all others.
   * Throws if the config is already active or not found.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async activateConfig(id) {
    const existing = await this.milestoneConfigRepository.findById(id);

    if (!existing) {
      throw new Error("MilestoneConfig not found");
    }

    if (existing.is_active) {
      throw new Error("Config is already active");
    }

    const activated = await this.milestoneConfigRepository.activateConfig(id);
    if (!activated) {
      throw new Error("Failed to activate config");
    }

    return activated;
  }

  _validateName(name) {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("name must be a non-empty string");
    }
  }

  _validateThresholds(thresholds) {
    if (!Array.isArray(thresholds) || thresholds.length === 0) {
      throw new Error("thresholds must be a non-empty array");
    }

    for (let i = 0; i < thresholds.length; i++) {
      const t = thresholds[i];

      if (typeof t.at !== "number" || t.at < 1 || !Number.isInteger(t.at)) {
        throw new Error(
          'Each threshold must have a positive integer "at" value'
        );
      }

      if (
        typeof t.points !== "number" ||
        t.points < 1 ||
        !Number.isInteger(t.points)
      ) {
        throw new Error(
          'Each threshold must have a positive integer "points" value'
        );
      }

      if (i > 0) {
        if (t.at <= thresholds[i - 1].at) {
          throw new Error(
            'Threshold "at" values must be in strictly ascending order'
          );
        }

        if (t.points < thresholds[i - 1].points) {
          throw new Error(
            'Threshold "points" values must be in ascending order'
          );
        }
      }
    }
  }

  /**
   * Update an inactive config's name and/or thresholds.
   * Throws if the config is active (read-only) or not found.
   * @param {string} id
   * @param {Object} data - { name?, thresholds? }
   * @returns {Promise<Object>}
   */
  async updateConfig(id, data) {
    const existing = await this.milestoneConfigRepository.findById(id);

    if (!existing) {
      throw new Error("MilestoneConfig not found");
    }

    if (existing.is_active) {
      throw new Error(
        "Cannot edit an active config — create a new one and activate it instead"
      );
    }

    const updates = {};

    if (data.name !== undefined) {
      this._validateName(data.name);
      updates.name = data.name.trim();
    }

    if (data.thresholds !== undefined) {
      this._validateThresholds(data.thresholds);
      updates.thresholds = data.thresholds;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    const updated = await this.milestoneConfigRepository.updateInactive(
      id,
      updates
    );
    if (!updated) {
      throw new Error("MilestoneConfig not found or is active");
    }

    return updated;
  }

  /**
   * Soft-delete an inactive config.
   * Throws if the config is active or not found.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteConfig(id) {
    const existing = await this.milestoneConfigRepository.findById(id);

    if (!existing) {
      throw new Error("MilestoneConfig not found");
    }

    if (existing.is_active) {
      throw new Error(
        "Cannot delete an active config — activate another config first"
      );
    }

    const deleted = await this.milestoneConfigRepository.softDelete(id);
    if (!deleted) {
      throw new Error("MilestoneConfig not found or is active");
    }

    return deleted;
  }
}

module.exports = MilestoneConfigService;
