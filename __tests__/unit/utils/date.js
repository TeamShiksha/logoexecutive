const { Timestamp } = require("firebase-admin/firestore");
const { normalizeDate } = require("../../../utils/date");

describe("normalizeDate", () => {
  it("Returns date when input is Firstore Timestamp", () => {
    const mockTimestamp = Timestamp.fromDate(new Date("01-01-2001"));
    const result = normalizeDate(mockTimestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2001);
  });

  it("Returns date when input is Date", () => {
    const mockDate = new Date("01-01-2001");
    const result = normalizeDate(mockDate);
		
    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2001);
  });
	
  it("Returns date when input is string", () => {
    const mockDate = "01-01-2001";
    const result = normalizeDate(mockDate);
		
    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2001);
  });

  it("Returns date when input is number", () => {
    const mockDate = new Date("01-01-2001").getTime();
    const result = normalizeDate(mockDate);
		
    expect(result).toBeInstanceOf(Date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2001);
  });
	
  it("Throws error when input is not a valid date", () => {
    const result = normalizeDate("date");

    expect(result).toBeNull();
  });
});
