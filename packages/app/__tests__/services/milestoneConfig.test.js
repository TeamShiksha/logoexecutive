/**
 * MilestoneConfigService Tests
 *
 * Tests for creating, reading, activating, updating, and deleting
 * admin-managed milestone configs. All DB calls are mocked via
 * jest.spyOn on MilestoneConfigRepository.prototype.
 */

const MilestoneConfigService = require("../../services/milestoneConfig");
const { MilestoneConfigRepository } = require("../../repositories");
const {
  MOCK_USERS,
  MOCK_MILESTONE_CONFIG,
  MOCK_MILESTONE_CONFIG_INACTIVE,
} = require("../../utils/mocks");
const mongoose = require("mongoose");

describe("MilestoneConfigService", () => {
  let service;
  const adminId = MOCK_USERS[2]._id.toString();

  beforeEach(() => {
    service = new MilestoneConfigService();
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("should initialise milestoneConfigRepository", () => {
      expect(service.milestoneConfigRepository).toBeDefined();
      expect(service.milestoneConfigRepository).toBeInstanceOf(
        MilestoneConfigRepository
      );
    });
  });

  describe("getAllConfigs", () => {
    it("should return all non-deleted configs (active first)", async () => {
      const configs = [MOCK_MILESTONE_CONFIG, MOCK_MILESTONE_CONFIG_INACTIVE];
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findAll")
        .mockResolvedValue(configs);

      const result = await service.getAllConfigs();

      expect(result).toEqual(configs);
      expect(MilestoneConfigRepository.prototype.findAll).toHaveBeenCalledTimes(
        1
      );
    });

    it("should return an empty array when no configs exist", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findAll")
        .mockResolvedValue([]);

      const result = await service.getAllConfigs();

      expect(result).toEqual([]);
    });

    it("should propagate repository errors", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findAll")
        .mockRejectedValue(new Error("DB error"));

      await expect(service.getAllConfigs()).rejects.toThrow("DB error");
    });
  });

  describe("getConfigById", () => {
    it("should return the config when found", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);

      const result = await service.getConfigById(MOCK_MILESTONE_CONFIG._id);

      expect(result).toEqual(MOCK_MILESTONE_CONFIG);
    });

    it("should return null when config is not found", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(null);

      const result = await service.getConfigById(new mongoose.Types.ObjectId());

      expect(result).toBeNull();
    });
  });

  describe("getActiveConfig", () => {
    it("should return the active config", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findActive")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);

      const result = await service.getActiveConfig();

      expect(result).toEqual(MOCK_MILESTONE_CONFIG);
      expect(result.is_active).toBe(true);
    });

    it("should return null when no active config exists", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findActive")
        .mockResolvedValue(null);

      const result = await service.getActiveConfig();

      expect(result).toBeNull();
    });
  });

  describe("createConfig", () => {
    const validData = {
      name: "Q3 2026",
      thresholds: [
        { at: 5, points: 10 },
        { at: 10, points: 20 },
      ],
    };

    it("should create a config (inactive by default)", async () => {
      const created = { ...MOCK_MILESTONE_CONFIG_INACTIVE, ...validData };
      jest
        .spyOn(MilestoneConfigRepository.prototype, "create")
        .mockResolvedValue(created);

      const result = await service.createConfig(validData, adminId);

      expect(result).toEqual(created);
      expect(MilestoneConfigRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validData.name,
          thresholds: validData.thresholds,
          is_active: false,
          created_by: adminId,
        })
      );
    });

    it("should throw when name is missing", async () => {
      await expect(
        service.createConfig({ thresholds: [{ at: 5, points: 10 }] }, adminId)
      ).rejects.toThrow("name is required");
    });

    it("should throw when name is an empty string", async () => {
      await expect(
        service.createConfig(
          { name: "  ", thresholds: [{ at: 5, points: 10 }] },
          adminId
        )
      ).rejects.toThrow("name is required");
    });

    it("should throw when thresholds is missing", async () => {
      await expect(
        service.createConfig({ name: "Test" }, adminId)
      ).rejects.toThrow("thresholds must be a non-empty array");
    });

    it("should throw when thresholds is an empty array", async () => {
      await expect(
        service.createConfig({ name: "Test", thresholds: [] }, adminId)
      ).rejects.toThrow("thresholds must be a non-empty array");
    });

    it("should throw when a threshold has an invalid 'at' value", async () => {
      await expect(
        service.createConfig(
          { name: "Test", thresholds: [{ at: 0, points: 10 }] },
          adminId
        )
      ).rejects.toThrow(/"at"/);
    });

    it("should throw when a threshold has an invalid 'points' value", async () => {
      await expect(
        service.createConfig(
          { name: "Test", thresholds: [{ at: 5, points: -1 }] },
          adminId
        )
      ).rejects.toThrow(/"points"/);
    });

    it("should trim the config name before saving", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "create")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await service.createConfig(
        { name: "  Padded Name  ", thresholds: [{ at: 5, points: 10 }] },
        adminId
      );

      expect(MilestoneConfigRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Padded Name" })
      );
    });

    it("should throw when 'at' values are not in strictly ascending order", async () => {
      await expect(
        service.createConfig(
          {
            name: "Test",
            thresholds: [
              { at: 10, points: 20 },
              { at: 5, points: 30 },
            ],
          },
          adminId
        )
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when 'at' values have duplicates", async () => {
      await expect(
        service.createConfig(
          {
            name: "Test",
            thresholds: [
              { at: 5, points: 10 },
              { at: 5, points: 20 },
            ],
          },
          adminId
        )
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when 'points' values are not in ascending order", async () => {
      await expect(
        service.createConfig(
          {
            name: "Test",
            thresholds: [
              { at: 5, points: 50 },
              { at: 10, points: 20 },
            ],
          },
          adminId
        )
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when 'at' value is not an integer", async () => {
      await expect(
        service.createConfig(
          { name: "Test", thresholds: [{ at: 5.5, points: 10 }] },
          adminId
        )
      ).rejects.toThrow(/integer/);
    });

    it("should throw when 'points' value is not an integer", async () => {
      await expect(
        service.createConfig(
          { name: "Test", thresholds: [{ at: 5, points: 10.5 }] },
          adminId
        )
      ).rejects.toThrow(/integer/);
    });
  });

  describe("activateConfig", () => {
    it("should activate an inactive config", async () => {
      const activated = { ...MOCK_MILESTONE_CONFIG_INACTIVE, is_active: true };

      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);
      jest
        .spyOn(MilestoneConfigRepository.prototype, "activateConfig")
        .mockResolvedValue(activated);

      const result = await service.activateConfig(
        MOCK_MILESTONE_CONFIG_INACTIVE._id
      );

      expect(result.is_active).toBe(true);
      expect(
        MilestoneConfigRepository.prototype.activateConfig
      ).toHaveBeenCalledWith(MOCK_MILESTONE_CONFIG_INACTIVE._id);
    });

    it("should throw when config is not found", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.activateConfig(new mongoose.Types.ObjectId())
      ).rejects.toThrow("MilestoneConfig not found");
    });

    it("should throw when config is already active", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG); // is_active: true

      await expect(
        service.activateConfig(MOCK_MILESTONE_CONFIG._id)
      ).rejects.toThrow("Config is already active");
    });

    it("should not call activateConfig repository method when already active", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);
      const activateSpy = jest.spyOn(
        MilestoneConfigRepository.prototype,
        "activateConfig"
      );

      await expect(
        service.activateConfig(MOCK_MILESTONE_CONFIG._id)
      ).rejects.toThrow();

      expect(activateSpy).not.toHaveBeenCalled();
    });
  });

  describe("updateConfig", () => {
    it("should update an inactive config's name", async () => {
      const updated = { ...MOCK_MILESTONE_CONFIG_INACTIVE, name: "Renamed" };

      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);
      jest
        .spyOn(MilestoneConfigRepository.prototype, "updateInactive")
        .mockResolvedValue(updated);

      const result = await service.updateConfig(
        MOCK_MILESTONE_CONFIG_INACTIVE._id,
        { name: "Renamed" }
      );

      expect(result.name).toBe("Renamed");
      expect(
        MilestoneConfigRepository.prototype.updateInactive
      ).toHaveBeenCalledWith(
        MOCK_MILESTONE_CONFIG_INACTIVE._id,
        expect.objectContaining({ name: "Renamed" })
      );
    });

    it("should update an inactive config's thresholds", async () => {
      const newThresholds = [{ at: 10, points: 25 }];
      const updated = {
        ...MOCK_MILESTONE_CONFIG_INACTIVE,
        thresholds: newThresholds,
      };

      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);
      jest
        .spyOn(MilestoneConfigRepository.prototype, "updateInactive")
        .mockResolvedValue(updated);

      const result = await service.updateConfig(
        MOCK_MILESTONE_CONFIG_INACTIVE._id,
        { thresholds: newThresholds }
      );

      expect(result.thresholds).toEqual(newThresholds);
    });

    it("should throw when config is not found", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.updateConfig(new mongoose.Types.ObjectId(), { name: "X" })
      ).rejects.toThrow("MilestoneConfig not found");
    });

    it("should throw when trying to edit an active config", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG); // is_active: true

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG._id, { name: "Changed" })
      ).rejects.toThrow("Cannot edit an active config");
    });

    it("should throw when no valid fields are provided", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {})
      ).rejects.toThrow("No valid fields provided for update");
    });

    it("should throw when updated thresholds array is empty", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [],
        })
      ).rejects.toThrow("thresholds must be a non-empty array");
    });

    it("should throw when a threshold in update has invalid 'at' value", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [{ at: -5, points: 10 }],
        })
      ).rejects.toThrow(/"at"/);
    });

    it("should not call updateInactive when active config is targeted", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);
      const updateSpy = jest.spyOn(
        MilestoneConfigRepository.prototype,
        "updateInactive"
      );

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG._id, { name: "Blocked" })
      ).rejects.toThrow();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it("should throw when updated 'at' values are not in strictly ascending order", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [
            { at: 20, points: 10 },
            { at: 10, points: 20 },
          ],
        })
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when updated 'at' values have duplicates", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [
            { at: 10, points: 10 },
            { at: 10, points: 20 },
          ],
        })
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when updated 'points' values are not in ascending order", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [
            { at: 5, points: 50 },
            { at: 10, points: 20 },
          ],
        })
      ).rejects.toThrow(/ascending order/);
    });

    it("should throw when updated 'at' value is not an integer", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [{ at: 5.5, points: 10 }],
        })
      ).rejects.toThrow(/integer/);
    });

    it("should throw when updated 'points' value is not an integer", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);

      await expect(
        service.updateConfig(MOCK_MILESTONE_CONFIG_INACTIVE._id, {
          thresholds: [{ at: 5, points: 10.5 }],
        })
      ).rejects.toThrow(/integer/);
    });
  });

  describe("deleteConfig", () => {
    it("should soft-delete an inactive config", async () => {
      const deleted = { ...MOCK_MILESTONE_CONFIG_INACTIVE, is_deleted: true };

      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG_INACTIVE);
      jest
        .spyOn(MilestoneConfigRepository.prototype, "softDelete")
        .mockResolvedValue(deleted);

      const result = await service.deleteConfig(
        MOCK_MILESTONE_CONFIG_INACTIVE._id
      );

      expect(result.is_deleted).toBe(true);
      expect(
        MilestoneConfigRepository.prototype.softDelete
      ).toHaveBeenCalledWith(MOCK_MILESTONE_CONFIG_INACTIVE._id);
    });

    it("should throw when config is not found", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(null);

      await expect(
        service.deleteConfig(new mongoose.Types.ObjectId())
      ).rejects.toThrow("MilestoneConfig not found");
    });

    it("should throw when trying to delete an active config", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG); // is_active: true

      await expect(
        service.deleteConfig(MOCK_MILESTONE_CONFIG._id)
      ).rejects.toThrow("Cannot delete an active config");
    });

    it("should not call softDelete when config is active", async () => {
      jest
        .spyOn(MilestoneConfigRepository.prototype, "findById")
        .mockResolvedValue(MOCK_MILESTONE_CONFIG);
      const deleteSpy = jest.spyOn(
        MilestoneConfigRepository.prototype,
        "softDelete"
      );

      await expect(
        service.deleteConfig(MOCK_MILESTONE_CONFIG._id)
      ).rejects.toThrow();

      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });
});
