const { LogoRequestLogsRepository } = require("../../repositories");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

describe("LogoRequestLogsRepository", () => {
  let repository;

  beforeEach(() => {
    repository = new LogoRequestLogsRepository();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("getCurrentMonthData", () => {
    it("uses the current calendar month boundaries", async () => {
      const aggregateSpy = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([
          {
            date: "2026-04-01",
            count: 3,
            totalKB: 1.5,
          },
        ]);

      const result = await repository.getCurrentMonthData(
        "64f1b2c3d4e5f67890123456"
      );

      expect(aggregateSpy).toHaveBeenCalledTimes(1);

      const pipeline = aggregateSpy.mock.calls[0][0];
      const matchStage = pipeline[0].$match;

      expect(dayjs.utc(matchStage.createdAt.$gte).format("YYYY-MM-DD")).toBe(
        "2026-04-01"
      );
      expect(dayjs.utc(matchStage.createdAt.$lte).format("YYYY-MM-DD")).toBe(
        "2026-04-30"
      );
      expect(result.period).toBe("month");
      expect(result.startDate).toBe("2026-04-01");
      expect(result.endDate).toBe("2026-04-30");
    });
  });

  describe("getCurrentWeekData", () => {
    it("uses the current calendar week boundaries", async () => {
      const aggregateSpy = jest
        .spyOn(repository.model, "aggregate")
        .mockResolvedValue([
          {
            date: "2026-04-26",
            count: 3,
            totalKB: 1.5,
          },
        ]);

      const result = await repository.getCurrentWeekData(
        "64f1b2c3d4e5f67890123456"
      );

      expect(aggregateSpy).toHaveBeenCalledTimes(1);

      const pipeline = aggregateSpy.mock.calls[0][0];
      const matchStage = pipeline[0].$match;

      // April 27, 2026 is a Monday. startOf('week') depends on locale but usually it's Sunday (April 26)
      // dayjs().startOf('week') for 2026-04-27 will be 2026-04-26
      expect(dayjs.utc(matchStage.createdAt.$gte).format("YYYY-MM-DD")).toBe(
        "2026-04-26"
      );
      expect(dayjs.utc(matchStage.createdAt.$lte).format("YYYY-MM-DD")).toBe(
        "2026-05-02"
      );
      expect(result.period).toBe("week");
      expect(result.startDate).toBe("2026-04-26");
      expect(result.endDate).toBe("2026-05-02");
    });
  });
});
