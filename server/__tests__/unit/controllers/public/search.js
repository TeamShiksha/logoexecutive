const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { ImageService } = require("../../../../services");
const Images = require("../../../../models/Images");
const { mockImages } = require("../../../../utils/mocks/Images");

jest.mock("../../../../services/Images", () => ({
  fetchImageByCompanyFree: jest.fn(),
}));

jest.mock("../../../../models/Images");

const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
const ENDPOINT = "/api/public/search";

describe("demoSearchLogoController", () => {
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
    const mockQuery = { };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "domainKey is required",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("500 - Not allowed by CORS", async () => {
    const mockQuery = { domainKey: "dummy" };
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

  it("422 - domainKey URL cannot be empty", async () => {
    const mockQuery = { domainKey: "https://.com" };

    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "domainKey URL cannot be empty",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("500 - Unexpected error", async () => {
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });
    const mockQuery = { domainKey: "go" };
    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("404 - No companies found", async () => {
    const mockQuery = { domainKey: "unknownDomain" };
    jest.spyOn(Images, "find").mockResolvedValue([]);
  
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No companies found matching the provided domain key.",
      statusCode: 404,
      error: STATUS_CODES[404],
    });
  });

  it("200 - Success response when domainKey is given", async () => {
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });

    const mockQuery = { domainKey: "go" };
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
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });

    const mockQuery = { domainKey: "https://www.aircon.com" };
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
