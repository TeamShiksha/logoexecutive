const request = require("supertest");
const { ImageService, UserSessionService } = require("../../../services");
const { STATUS_CODES } = require("http");
const app = require("../../../server");
const {
  MOCK_IMAGES,
  MOCK_USER_SESSIONS,
  MOCK_SESSION_ID,
} = require("../../../utils/mocks");
const { Messages } = require("../../../utils/constants");

describe("POST /api/catalog/logo", () => {
  beforeAll(() => {
    process.env.CLIENT_PROXY_URL = "https://validcorsorigin.com";
    process.env.KEY = "logos";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    delete process.env.CLIENT_PROXY_URL;
    delete process.env.KEY;
  });

  it("should return 400 if image already exist as a response for admin", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest
      .spyOn(ImageService.prototype, "getImageByCompanyName")
      .mockResolvedValue(MOCK_IMAGES[0]);
    const res = await request(app)
      .post("/api/catalog/logo")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({
        companyName: "GOOGLE",
        companyUri: "https://google.com/",
        imageSize: 1024,
        extension: "png",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: STATUS_CODES[400],
      statusCode: 400,
      message: Messages.IMAGE_ALREADY_EXISTS,
    });
  });

  it("should return 500 if imageData is not present in response for admin", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest
      .spyOn(ImageService.prototype, "getImageByCompanyName")
      .mockResolvedValue(null);

    jest
      .spyOn(ImageService.prototype, "createImageData")
      .mockResolvedValue(null);

    const res = await request(app)
      .post("/api/catalog/logo")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({
        companyUri: "https://google.com/",
        size: 1024,
        extension: "png",
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      error: STATUS_CODES[500],
      statusCode: 500,
      message: Messages.UPDATE_IMAGE_FAILED,
    });
  });

  it("should return 200 if imageData present in response for admin", async () => {
    jest
      .spyOn(UserSessionService.prototype, "validateSession")
      .mockResolvedValue(MOCK_USER_SESSIONS[2]);
    jest.spyOn(ImageService.prototype, "createImageData").mockResolvedValue({
      imageData: {
        id: "651f3a8d2b4c9e12f7a9d3f4",
        updatedAt: "2025-10-03T14:27:59.123Z",
      },
    });
    const res = await request(app)
      .post("/api/catalog/logo")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({
        companyName: "GOOGLE",
        companyUri: "https://google.com/",
        imageSize: 1024,
        extension: "png",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      statusCode: 200,
      message: Messages.UPLOAD_SUCCESS,
      data: {
        imageData: {
          id: "651f3a8d2b4c9e12f7a9d3f4",
          updatedAt: "2025-10-03T14:27:59.123Z",
        },
      },
    });
  });

  it("should return 500 if imageData is not present in response for operator", async () => {
    jest
      .spyOn(ImageService.prototype, "createImageData")
      .mockResolvedValue(null);

    const res = await request(app)
      .post("/api/catalog/logo")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({
        companyName: "GOOGLE",
        companyUri: "https://google.com/",
        imageSize: 1024,
        extension: "png",
      });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual({
      error: STATUS_CODES[500],
      statusCode: 500,
      message: Messages.UPDATE_IMAGE_FAILED,
    });
  });

  it("should return 200 if imageData present in response for operator", async () => {
    jest.spyOn(ImageService.prototype, "createImageData").mockResolvedValue({
      imageData: {
        id: "651f3a8d2b4c9e12f7a9d3f4",
        updatedAt: "2025-10-03T14:27:59.123Z",
      },
    });
    const res = await request(app)
      .post("/api/catalog/logo")
      .set("Cookie", `sessionId=${MOCK_SESSION_ID}`)
      .send({
        companyName: "GOOGLE",
        companyUri: "https://google.com/",
        imageSize: 1024,
        extension: "png",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      statusCode: 200,
      message: Messages.UPLOAD_SUCCESS,
      data: {
        imageData: {
          id: "651f3a8d2b4c9e12f7a9d3f4",
          updatedAt: "2025-10-03T14:27:59.123Z",
        },
      },
    });
  });
});
