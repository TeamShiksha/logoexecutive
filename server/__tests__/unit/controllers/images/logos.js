const request = require("supertest");
const app = require("../../../../app");
const KeyService = require("../../../../services/Key");
const LogoService = require("../../../../services/Logo");
const { mockUsers } = require("../../../../utils/mocks/Users");
const { STATUS_CODES } = require("http");
const User = require("../../../../models/Users");


jest.mock("../../../../services/Key", () => ({
  isAPIKeyPresent: jest.fn()
}));

jest.mock("../../../../services/Logo", () => ({
  fetchImageByCompanyFree: jest.fn()
}));

const mockUserModel = new User(mockUsers[0]);
const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwWxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";


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

  it("422 - API Key is NOT present", async () => {

    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(KeyService, "isAPIKeyPresent")
      .mockImplementation(() => true);

    jest
      .spyOn(LogoService, "fetchImageByCompanyFree")
      .mockImplementation(() => mockCDNLink);

    const mockQuery = {"companyName": "coupang"};
    const response = await request(app)
      .get("/api/images/logo")
      .set("cookie", `jwt=${mockToken}`)
      .query(mockQuery);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Please provide proper Company name and API Key",
      statusCode: 422,
      error: STATUS_CODES[422]
    });
  });

  it("422 - company name is NOT present", async () => {

    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(KeyService, "isAPIKeyPresent")
      .mockImplementation(() => true);

    jest
      .spyOn(LogoService, "fetchImageByCompanyFree")
      .mockImplementation(() => mockCDNLink);

    const mockQuery = {"apiKey": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get("/api/images/logo")
      .set("cookie", `jwt=${mockToken}`)
      .query(mockQuery);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "Please provide proper Company name and API Key",
      statusCode: 422,
      error: STATUS_CODES[422]
    });
  });

  it("403 - API key is not valid", async () => {

    const mockToken = mockUserModel.generateJWT();

    const mockQuery = {"companyName": "coupang", "apiKey": "2B1B1BF5F9914BCD85A0B1122C71EDDC"};
    const response = await request(app)
      .get("/api/images/logo")
      .set("cookie", `jwt=${mockToken}`)
      .query(mockQuery);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Given API key was not found",
      statusCode: 403,
      error: STATUS_CODES[403]
    });
  });

  it("404 - image is not found for given company name", async () => {

    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(KeyService, "isAPIKeyPresent")
      .mockImplementation(() => true);

    const mockQuery = {"companyName": "infibeam", "apiKey": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get("/api/images/logo")
      .set("cookie", `jwt=${mockToken}`)
      .query(mockQuery);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No image found for company name infibeam",
      statusCode: 404,
      error: STATUS_CODES[404]
    });
  });

  it("200 - image is found for the company name with the correct API Key", async () => {

    const mockToken = mockUserModel.generateJWT();

    jest
      .spyOn(KeyService, "isAPIKeyPresent")
      .mockImplementation(() => true);

    jest
      .spyOn(LogoService, "fetchImageByCompanyFree")
      .mockImplementation(() => mockCDNLink);

    const mockQuery = {"companyName": "coupang", "apiKey": "2B1B1BF5F9914BCD85A0B1122C71EDDB"};
    const response = await request(app)
      .get("/api/images/logo")
      .set("cookie", `jwt=${mockToken}`)
      .query(mockQuery);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Image Link successfully generated for coupang",
      statusCode: 200,
      data: mockCDNLink
    });
  });
});
