const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { KeyService, ImageService } = require("../../../../services");

jest.mock("../../../../services/Keys", () => ({
  isAPIKeyPresent: jest.fn()
}));
jest.mock("../../../../services/Images", () => ({
  fetchImageByCompanyFree: jest.fn()
}));

const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwWxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
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
    const mockQuery = {"domain": "coupang"};
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
    const mockQuery = {"API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
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
    const mockQuery = {"domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDC"};
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
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => true);
    const mockQuery = {"domain": "infibeam", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
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

  it("500 - Unexpected error", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => {throw new Error("Unexpected error");});
    const mockQuery = {"domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("200 - CDN url created for company name", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => true);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "coupang", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: mockCDNLink
    });
  });

  it("Success response when domain is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => true);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "www.coupang.com", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: mockCDNLink
    });
  });

  it("Success when company url is given", async () => {
    jest.spyOn(KeyService, "isAPIKeyPresent").mockImplementation(() => true);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "https://www.coupang.com", "API_KEY": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
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
