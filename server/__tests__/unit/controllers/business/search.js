const request = require("supertest");
const { STATUS_CODES } = require("http");
const app = require("../../../../app");
const { ImageService } = require("../../../../services");
const { Images, Keys, Subscriptions } = require("../../../../models/index");
const { mockImages } = require("../../../../utils/mocks/Images");

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

  it("422 - domainKey URL cannot be empty", async () => {
    const mockQuery = {
      domainKey: "https://.com",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };

    const response = await request(app).get(ENDPOINT).query(mockQuery);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: "domainKey URL cannot be empty",
      statusCode: 422,
      error: STATUS_CODES[422],
    });
  });

  it("403 - Invalid API key", async () => {
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDC",
    };
    jest.spyOn(Keys, "aggregate").mockResolvedValue([]); // No user found
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Invalid API key",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("403 - API Key Limit reached. Consider upgrading your plan", async () => {
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    jest.spyOn(Keys, "aggregate").mockResolvedValue([{
      subscriptionDetails: {
        usageCount: 500,
        usageLimit: 500,
      }
    }]);
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: "Limit reached. Consider upgrading your plan",
      statusCode: 403,
      error: STATUS_CODES[403],
    });
  });

  it("500 - Unexpected error", async () => {
    const mockQuery = {
      domainKey: "dummy",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    jest.spyOn(Keys, "aggregate").mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Unexpected error",
      error: STATUS_CODES[500],
      statusCode: 500,
    });
  });

  it("404 - No companies found", async () => {
    const mockQuery = {
      domainKey: "unknownDomain",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    jest.spyOn(Keys, "aggregate").mockResolvedValue([{
      user: "mockUserId",
      subscriptionDetails: {
        usageCount: 0,
        usageLimit: 500,
      }
    }]);
    jest.spyOn(Images, "find").mockResolvedValue([]); // No companies found
  
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "No companies found matching the provided domain key.",
      statusCode: 404,
      error: STATUS_CODES[404],
    });
  });

  it("200 - Success response when domainKey is given", async () => {
    const mockQuery = {
      domainKey: "go",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    jest.spyOn(Keys, "aggregate").mockResolvedValue([{
      user: "mockUserId",
      subscriptionDetails: {
        usageCount: 0,
        usageLimit: 500,
      }
    }]);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });
    jest.spyOn(Subscriptions, "updateOne").mockResolvedValue();
  
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    const expectedData = [
      {
        companyName: "GODADDY",
        image: mockCDNLink,
      },
      {
        companyName: "GOOGLE",
        image: mockCDNLink,
      },
    ];
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: expectedData,
    });
  });

  it("200 - Success response when domain URL is given", async () => {
    const mockQuery = {
      domainKey: "https://www.aircon.com",
      API_KEY: "2B1B1BF5F9914BCD85A0B1122C71EDDB",
    };
    jest.spyOn(Keys, "aggregate").mockResolvedValue([{
      user: "mockUserId",
      subscriptionDetails: {
        usageCount: 0,
        usageLimit: 500,
      }
    }]);
    jest.spyOn(ImageService, "fetchImageByCompanyFree").mockResolvedValue(mockCDNLink);
    jest.spyOn(Images, "find").mockImplementation((query) => {
      const regex = query.domainame.$regex;
      const filteredImages = mockImages.filter((company) => regex.test(company.domainame));
      return filteredImages;
    });
    jest.spyOn(Subscriptions, "updateOne").mockResolvedValue();
  
    const response = await request(app).get(ENDPOINT).query(mockQuery);
  
    const expectedData = [
      {
        companyName: "AIRCON",
        image: mockCDNLink,
      },
    ];
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: expectedData,
    });
  });
});
