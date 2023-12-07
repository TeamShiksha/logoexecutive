const cloudfrontSigner = require("@aws-sdk/cloudfront-signer");

const getSignedUrl = cloudfrontSigner.getSignedUrl;

function cloudFrontSignedURL(path) {
  const distributionDomain = process.env.DISTRIBUTION_DOMAIN;
  if (path !== "") {
    return {
      data: getSignedUrl({
        url: `${distributionDomain}${path}`,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 5),
        privateKey: process.env.CLOUD_FRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUD_FRONT_KEYPAIR_ID,
      }),
      success: true,
    };
  }
  return {
    message: "image path is not defined",
    success: false,
  };
}

module.exports = { cloudFrontSignedURL };
