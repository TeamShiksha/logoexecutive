const cloudfrontSigner = require("@aws-sdk/cloudfront-signer");
const getSignedUrl = cloudfrontSigner.getSignedUrl;

const signedURLFunction = (distributionDomain, path) => {
  //distributionDomain - Distribution domain name
  //path - image name
  return getSignedUrl({
    url: `${distributionDomain}${path}`,
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    privateKey: process.env.CLOUD_FRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUD_FRONT_KEYPAIR_ID,
  });
};

module.exports = { signedURLFunction };
