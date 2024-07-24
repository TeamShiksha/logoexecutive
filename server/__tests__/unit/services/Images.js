const mongoose = require("mongoose");
const cloudfrontSigner = require("@aws-sdk/cloudfront-signer");
const cloudFront = require("../../../utils/cloudFront");
const {
  fetchImageByCompanyFree,
  getImagesByUserId,
  createImageData,
  uploadToS3,
} = require("../../../services/Images");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Images } = require("../../../models");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../../utils/cloudFront", () => ({
  cloudFrontSignedURL: jest.fn(),
}));

jest.mock("@aws-sdk/cloudfront-signer", ()=>({
  getSignedUrl: jest.fn()
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
}));

const mockImage = new Images({
  domainame: "google.com",
  extension: "jpg",
  createdAt: new Date("2002-02-02"),
  updatedAt: new Date("2002-02-02"),
  uploadedBy: new mongoose.Types.ObjectId() 
});

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongo_uri = mongoServer.getUri();
  await mongoose.connect(mongo_uri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("uploadToS3", () => {
  beforeEach(()=>{
    process.env.BUCKET_NAME="Demo",
    process.env.KEY="logo";
  });
  afterEach(()=>{
    jest.resetAllMocks();
  });
  it("should upload a file to S3 and return the URL", async () => {
    const mockFile = { buffer: Buffer.from("mock file data") };
    const mockResponse = { Key: "mock/key/image.jpg" };
    const s3Client = new S3Client();
    s3Client.send.mockResolvedValue(mockResponse);
    const result = await uploadToS3(mockFile, "image", "jpg");
    expect(result).toBe(`${process.env.KEY}/jpg/image`);
    expect(S3Client).toHaveBeenCalled();
    expect(S3Client).toHaveBeenCalledWith({
      region: process.env.BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
  });

  it("should throw an error when the upload fails", async () => {
    const mockFile = { buffer: Buffer.from("test") };
    const mockError = new Error("Upload failed");
    PutObjectCommand.mockImplementation(() => {
      throw mockError;
    });
    await expect(uploadToS3(mockFile, "testImage", "jpg")).rejects.toThrow(mockError);
  });
});

describe("fetchImageByCompanyFree", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await Images.deleteMany({});
  });
  it("should fetch image CDN URL by company successfully", async () => {
    const image  = new Images(mockImage);
    await image.save();
    const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwWxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
    const mockSignedUrl = jest.fn(() => mockCDNLink);
    jest.spyOn(cloudfrontSigner, "getSignedUrl").mockImplementation(mockSignedUrl);
    jest.spyOn(cloudFront, "cloudFrontSignedURL").mockImplementation(() => ({ data: mockCDNLink, success: true }));
    const company = "google.com";
    const result = await fetchImageByCompanyFree(company, "jpg");
    expect(result).toEqual(mockCDNLink);
  });

  it("should return null when no image is found", async () => {
    const company = "non_existent_image.jpg";
    const result = await fetchImageByCompanyFree(company, "jpg");
    expect(result).toBeNull();
  });

  it("should throw an error if an error occurs during image retrieval", async () => {
    const mockError = "Test error";
    jest.spyOn(Images, "findOne").mockImplementationOnce(() => {
      throw new Error(mockError);
    });
    const company = "error_image.jpg";
    await expect(fetchImageByCompanyFree(company, "jpg")).rejects.toThrow(mockError);
  });
});

describe("getImagesByUserId", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await Images.deleteMany({});
  });

  it("should return all the images if the user has images uploaded", async () => {
    const image  = new Images(mockImage);
    await image.save();
    const userId = mockImage.uploadedBy;
    const imageData = await getImagesByUserId(userId);
    expect(imageData).toEqual([
      {
        _id : mockImage._id,
        domainame: mockImage.domainame,
        createdAt: mockImage.createdAt,
        updatedAt: mockImage.updatedAt,
      },
    ]);
  });

  it("should return null if no images were found", async () => {
    const userId = mockImage.uploadedBy;
    const imageData = await getImagesByUserId(userId);
    expect(imageData).toBeNull();
  });

  test("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    const userId = mockImage.uploadedBy._id;
    jest.spyOn(Images, "find").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    await expect(getImagesByUserId(userId)).rejects.toThrow(errorMessage);
  });
});

describe("createImageData", () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await Images.deleteMany({});
  });

  it("should create image data successfully", async () => {
    const domainame = "example.com";
    const uploadedBy =  new mongoose.Types.ObjectId();
    const extension = "png";
    const result = await createImageData(domainame, uploadedBy, extension);
    expect(result).toEqual({
      _id: expect.any(mongoose.Types.ObjectId),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  });

  it("should return null if data is improper", async () => {
    const domainame = "example.com";
    const uploadedBy =  undefined;
    const extension = "png";

    const createdUser = await createImageData(domainame, uploadedBy, extension);
    expect(createdUser).toBeNull();
  });

  it("should throw an error if MongoDB operation fails", async () => {
    const errorMessage = "MongoDB operation failed";
    jest.spyOn(Images.prototype, "save").mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    const domainame = "example.com";
    const uploadedBy = new mongoose.Types.ObjectId();
    const extension = "png";
    await expect(createImageData(domainame, uploadedBy, extension)).rejects.toThrow(errorMessage);
  });
});
