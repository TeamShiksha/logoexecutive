const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { KeyService, ImageService, SubscriptionService } = require("../../../../services");

jest.mock("../../../../services/Keys", () => ({
  isAPIKeyPresent: jest.fn(),
  fetchUserByApiKey: jest.fn()
}));

jest.mock("../../../../services/Subscriptions", () => ({
  isApiUsageLimitExceed: jest.fn(),
  updateApiUsageCount: jest.fn()
}));

jest.mock("../../../../services/Images", () => ({
  fetchImageByCompanyFree: jest.fn(),
}));

const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
const mockUser = "66a1c92b2ea4a39a015a9d14";
const ENDPOINT = "/api/business/logo";

describe("getLogoController", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "my_secret";
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("422 - API key is required", async () => {
    const mockQuery = { "domain": "coupang" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "API key is required",
      statusCode: 422,
      error: STATUS_CODES[422]
    });
  });

  it("422 - Domain is required", async () => {
    const mockQuery = { "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Domain is required",
      statusCode: 422,
      error: STATUS_CODES[422]
    });
  });

  it("403 - Invalid API key", async () => {
    const mockQuery = { "domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDC" };
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(false);
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Invalid API key",
      statusCode: 403,
      error: STATUS_CODES[403]
    });
  });

  it("404 - Logo not available", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(false);
    jest.spyOn(SubscriptionService, "updateApiUsageCount").mockResolvedValue(mockUser);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(null);
    const mockQuery = { "domain": "infibeam", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Logo not available",
      statusCode: 404,
      error: STATUS_CODES[404]
    });
  });

  it("403 - Limit reached. Consider upgrading your plan", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(true);
    const mockQuery = { "domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Limit reached. Consider upgrading your plan",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => { throw new Error("Unexpected error"); });
    const mockQuery = { "domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500
    });
  });

  it("200 - CDN URL created for company name", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    const mockQuery = { "domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: mockCDNLink
    });
  });

  it("200 - Success response when domain is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "updateApiUsageCount").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(false);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    const mockQuery = { "domain": "www.coupang.com", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: mockCDNLink
    });
  });

  it("200 - Success when company URL is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockResolvedValue(true);
    jest.spyOn(KeyService, "fetchUserByApiKey").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "updateApiUsageCount").mockResolvedValue(mockUser);
    jest.spyOn(SubscriptionService, "isApiUsageLimitExceed").mockResolvedValue(false);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    const mockQuery = { "domain": "https://www.coupang.com", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB" };
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: mockCDNLink
    });
  });
  
});
