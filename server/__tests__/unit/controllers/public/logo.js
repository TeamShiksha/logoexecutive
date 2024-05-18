const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { ImageService } = require("../../../../services");

jest.mock("../../../../services/Images", () => ({
  fetchImageByCompanyFree: jest.fn()
}));

const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwWxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
const ENDPOINT = "/api/public/logo";

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

  it("422 - Domain is required", async () => {
    const mockQuery = {};
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

  it("422 - Domain should not be empty", async () => {
    const mockQuery = {"domain": ""};
    const response = await request(app)
      .get(ENDPOINT)
      .query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "\"domain\" is not allowed to be empty",
      statusCode: 422,
      error: STATUS_CODES[422]
    });
  });

  it("404 - Logo not available", async () => {
    const mockQuery = {"domain": "infibeam"};
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
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => {throw new Error("Unexpected error");});
    const mockQuery = {"domain": "coupang"};
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

  it("500 - Not allowed by CORS", async () => {
    const mockQuery = {"domain": "coupang"};
    const response = await request(app)
      .get(ENDPOINT)
      .set("Origin", "http://invalidcorsorigin.com")
      .query(mockQuery);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: STATUS_CODES[500],
      message: "Not allowed by CORS",
      statusCode: 500,
    });
  });

  it("200 - CDN url created for company name", async () => {
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "coupang"};
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
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "www.coupang.com"};
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
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => mockCDNLink);
    const mockQuery = {"domain": "https://www.coupang.com"};
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