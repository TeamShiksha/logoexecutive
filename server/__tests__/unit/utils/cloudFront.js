const { cloudFrontSignedURL } = require("../../../utils/cloudFront");

jest.mock("@aws-sdk/cloudfront-signer", () => ({
  getSignedUrl: jest.fn(),
}));

describe("cloudFrontSignedURL", () => {
  beforeEach(() => {
    (process.env.DISTRIBUTION_DOMAIN = "https://example.cloudfront.net"),
    (process.env.CLOUD_FRONT_KEYPAIR_ID = "K1BTTIQA2ARGD9"),
    (process.env.CLOUD_FRONT_PRIVATE_KEY = `
      -----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA7ahamZIMTbcIlQaihkimJ76NiUb60xnwcZj5twz508coOwR6
WjmVNeorn+DEPHy36eZLW7SdNrYshDNAzTLXGxB92IRF9oy8OsQyaV433HIjcHff
QSfGnZTo2XiJOSQVN9QbV3VI1Za9zivFvGensF9Mfw7NdQh5qgh8HQmuQBr8z6qL
0R2SEj5v+1bVwqpvuSPNodtV4gufZ5vP9ZFEfXhVgzlEOWwJSj3ugmyFCPdBhLrd
WLQ6l4I0frQyUfzXcI0ht5BcRm8l0uuI/4v/xtv7eK0PuGOgwsCGdNHlALocHjTE
lbW21+VF2z4PvnIQIDAQABAoIBAFFRAW76YetVbUJQetunj/KZaKRH/RquDW9RAG
B5uCGWS1WmOpcUjNFdxn910K9BnUwS2EYQjpphyumQ/+M2OhOwmN60o5uwm9cfuo
ADFOoAw89/tIv+qB7TDLkcXReIGRp5IMHUB4/NfDRHFelZLi9S7EGtNu+MbtSXAq
CM52pXKMs7Y42gOKAnrHXCU+WKbrsaRzPDzXaGJrVxiGnLxsVH+2NxDHLbpdIX/9
wYUapHF0+TRHN3A3XzTfOadrPMyN2Ylis=
-----END RSA PRIVATE KEY-----
      `);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should successfully generate signed URL", () => {
    const path = "image.jpg";
    const result = cloudFrontSignedURL(path);
    expect(result.success).toBe(true);
  });

  it("should throw an error if image path does not exist", () => {
    const path = "";
    const result = cloudFrontSignedURL(path);
    expect(result.success).toBe(false);
    expect(result.message).toMatch("image path is not defined");
  });
});
