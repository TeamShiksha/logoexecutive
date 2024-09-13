const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { KeyService, ImageService, SubscriptionService } = require("../../../../services");
const Images = require("../../../../models/Images");
const { mockImages } = require("../../../../utils/mocks/Images");

jest.mock("../../../../services/Keys", () => ({
  isAPIKeyPresent: jest.fn(),
  fetchUserByApiKey: jest.fn(),
}));

jest.mock("../../../../services/Subscriptions", () => ({
  isApiUsageLimitExceed: jest.fn(),
  updateApiUsageCount: jest.fn(),
}));

jest.mock("../../../../services/Images", () => ({
  fetchImageByCompanyFree: jest.fn(),
}));

jest.mock("../../../../models/Images");

const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
const mockUser = "66a1c92b2ea4a39a015a9d14";
const mockApiKey = "2B1B1BF5F9914BCD85A0B1122C71EDDB";
const ENDPOINT = "/api/business/search";

describe("searchLogoController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("422 - Domain Key is required", async () => {
    const mockQuery = { API_KEY: mockApiKey };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "domainKey is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("422 - API key is required", async () => {
    const mockQuery = { domainKey: "dummy" };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "API key is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("403 - Invalid API key", async () => {
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDC",
    };
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(false);
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Invalid API key",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("403 - API Key Limit reached. Consider upgrading your plan", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(true);
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Limit reached. Consider upgrading your plan",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("200 - Success response when domainKey is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "updateApiUsageCount").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(false);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });

    const mockQuery = {
      domainKey: "go",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    const expectedData = [
      {
        companyName: "GODADDY",
        image: mockCDNLink
      },
      {
        companyName: "GOOGLE",
        image: mockCDNLink  
      }
    ];

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: expectedData,
    });
  });

  it("200 - Success response when domain URL is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "updateApiUsageCount").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(false);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });

    const mockQuery = {
      domainKey: "https://www.aircon.com",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    const expectedData = [
      {
        companyName: "AIRCON",
        image: mockCDNLink
      }
    ];

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: expectedData,
    });
  });
});
