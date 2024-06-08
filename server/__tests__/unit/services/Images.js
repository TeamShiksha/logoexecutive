const cloudfrontSigner = require("@aws-sdk/cloudfront-signer");
const { ImageCollection } = require("../../../utils/firestore");
const {fetchImageByCompanyFree, getImagesByUserId, createImageData, uploadToS3} = require("../../../services/Images");
const cloudFront = require("../../../utils/cloudFront");
const { Timestamp } = require("firebase-admin/firestore");
const { S3Client,PutObjectCommand } = require("@aws-sdk/client-s3");
const { Images } = require("../../../models");

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
const mockImage = new Images ({
  domainame :"google.jpg",
  extension: "jpg",
  imageId: "12579986-7ad0-4a58-b204-211b583ab05b",
  createdAt: Timestamp.fromDate(new Date("02-02-2002")),
  updatedAt:Timestamp.fromDate(new Date("02-02-2002")),
  uploadedBy :"5e8bf5ae-1ac3-4daf-b1e4-45d220cfb5a9"
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch image CDN URL by company successfully", async () => {
    await ImageCollection.doc(mockImage.imageId).set(mockImage.data);
    const mockCDNLink = "https://du4goljobz66l.cloudfront.net/meta.png?Expires=1706882374&Key-Pair-Id=K1CBTPCVEWK03E&Signature=l6ZpbQ-Z3WtJQ8inaDomAAAhcnnC0U2R~5Su7HWjC8fbbeQI4e4JBK368guQFYtc8rQAJMur446ozoXJE-9Hcj125NlZFSMqpeUsjam-nk9Wb2d8XGR6UjyxYLqGbhca8WYwl~h0CzHbe20PJXZbyuFPTufCrBTkIoh4o3Mg3MQDe2fPf5z6L9xLgVtbOrpJQoHZ0YlWTNvWJWutL-AFX8KbisrBaMi8zRa6h-mSfXuIoUyjziMRA5gPA0T8QSUJ8iLdbURwWxvRpRpM0Ohrjk06sWDSTkNzLL~pVNyL7LwO04mAHVK4XYgK5179xcZ-BjMMW1qJD3YF7G~xdcsXJw__";
    const mockSignedUrl = jest.fn(() => mockCDNLink);
    jest.spyOn(cloudfrontSigner, "getSignedUrl").mockImplementation(mockSignedUrl);
    jest.spyOn(cloudFront, "cloudFrontSignedURL").mockImplementation(() => ({ data: mockCDNLink, success: true }));
    const company = "google.jpg";
    const result = await fetchImageByCompanyFree(company, "jpg");
    expect(result).toEqual(mockCDNLink);
  });
  

  it("should return null when no image is found", async () => {
    const company = "non_existent_image.jpg";
    const result = await fetchImageByCompanyFree(company, "jpg");
    expect(result).toBeNull();
  });

  it("should throw an error if an error occurs during image retrieval", async () => {
    const mockError = new Error("Test error");
    jest.spyOn(ImageCollection, "where").mockReturnValueOnce({
      where: jest.fn(() => ({
        get: jest.fn().mockRejectedValueOnce(mockError),
      }))
    });
    const company = "error_image.jpg";
    await expect(fetchImageByCompanyFree(company, "jpg")).rejects.toThrow(mockError);
  });
  
});

describe("getImagesByUserId", ()=>{

  it("should return the all the images if the admin has images uploaded", async()=>{
    await ImageCollection.doc(mockImage.imageId).set(mockImage.data);
    const userId = "5e8bf5ae-1ac3-4daf-b1e4-45d220cfb5a9";
    const imageData = await getImagesByUserId(userId);
    expect(imageData).toEqual([{
      domainame:mockImage.domainame,
      imageId:mockImage.imageId,
      createdAt:mockImage.createdAt.toDate(),
      updatedAt:mockImage.updatedAt.toDate()
    }]);
  });

  it("should return  null if the no images were found", async()=>{
    const userId="5e8bf5ae-1ac3-4daf-b1e4-45d220cfb5ab";
    const imageData = await getImagesByUserId(userId);
    expect(imageData).toEqual(null);
  });

  test("should throw an error if Firestore operation fails", async () => {
    const errorMessage = "Firestore operation failed";
    const userId="5e8bf5ae-1ac3-4daf-b1e4-45d220cfb5a9";
    jest.spyOn(ImageCollection, "where").mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error(errorMessage))
    });
    await expect(getImagesByUserId(userId)).rejects.toThrow(errorMessage);
  });
});

describe("createImageData", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create image data successfully", async () => {
    const domainame = "example.com";
    const uploadedBy = "user123";
    const extension = "png";
    const result = await createImageData(domainame, uploadedBy, extension);
    expect(result).toEqual({
      imageId: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
  it("should return null if setting the document in the collection fails", async () => {
    const domainame = "example.com";
    const uploadedBy = "user123";
    const extension = "png";
    jest.spyOn(ImageCollection, "doc").mockReturnValue({
      set: jest.fn().mockResolvedValue(null)
    });
    const result = await createImageData(domainame, uploadedBy, extension);
    expect(result).toBeNull();
  });

  it("should return null if newImage is falsy", async () => {
    const result = await createImageData("", "", "");
    expect(result).toBeNull();
  });

  it("should throw an error and log if an error occurs during image data creation", async () => {
    const errorMessage = "Firestore operation failed";
    jest.spyOn(ImageCollection, "doc").mockReturnValue({
      set: jest.fn().mockRejectedValue(new Error(errorMessage))
    });
    await expect(createImageData("example.com", "user123", "png")).rejects.toThrow(errorMessage);
  });
});