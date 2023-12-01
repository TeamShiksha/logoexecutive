const cloudfrontSigner = require("@aws-sdk/cloudfront-signer");
const getSignedUrl = cloudfrontSigner.getSignedUrl;

const signedURLFunction = (path) => {
  try {
    const distributionDomain = process.env.DISTRIBUTION_DOMAIN;
    if (path !== "") {
      return getSignedUrl({
        url: `${distributionDomain}${path}`,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 5),
        privateKey: process.env.CLOUD_FRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUD_FRONT_KEYPAIR_ID,
      });
    } else {
      return {
        message: "image path is not defined",
      };
    }
  } catch (err) {
    return {
      Error: err,
    };
  }
};

module.exports = { signedURLFunction };
