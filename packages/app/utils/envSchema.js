const Joi = require("joi");

const EnvSchema = Joi.object()
  .keys({
    CLIENT_URL: Joi.string().uri().required(),
    CLIENT_PROXY_URL: Joi.string().uri().required(),
    PORT: Joi.alternatives(
      Joi.string().regex(/^\d+$/),
      Joi.number()
    ).required(),
    CLOUD_FRONT_KEYPAIR_ID: Joi.string()
      .regex(/^[A-Z0-9]+$/)
      .required(),
    CLOUD_FRONT_PRIVATE_KEY: Joi.string().required(),
    DISTRIBUTION_DOMAIN: Joi.string()
      .uri({ scheme: ["https"] })
      .regex(/^https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
      .required(),
    BUCKET_NAME: Joi.string().required(),
    BUCKET_REGION: Joi.string().required(),
    ACCESS_KEY: Joi.string().required(),
    SECRET_ACCESS_KEY: Joi.string().required(),
    MONGO_URL: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid("dev", "test", "prod")
      .insensitive()
      .required(),
    EMAIL_SERVICE_URL: Joi.string().optional(),
    EMAIL_SERVICE_AUTH_TOKEN: Joi.string().optional(),
    ADMINSEMAILS: Joi.string().required(),
    BUCKET_KEY: Joi.string().required(),
    CRYPTO_KEY: Joi.string().length(64).hex().required().messages({
      "string.length":
        "Crypto key must be exactly 64 hex characters (32 bytes)",
      "string.hex": "Crypto key must be a valid hex string",
    }),
    DISCORD_CLIENT_ID: Joi.string().optional(),
    DISCORD_CLIENT_SECRET: Joi.string().optional(),
    DISCORD_REDIRECT_URI: Joi.string().uri().optional(),
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_REDIRECT_URI: Joi.string().uri().optional(),
    LINKEDIN_CLIENT_ID: Joi.string().optional(),
    LINKEDIN_CLIENT_SECRET: Joi.string().optional(),
    LINKEDIN_REDIRECT_URI: Joi.string().uri().optional(),
    GITHUB_CLIENT_ID: Joi.string().optional(),
    GITHUB_CLIENT_SECRET: Joi.string().optional(),
    GITHUB_REDIRECT_URI: Joi.string().uri().optional(),
  })
  .unknown(true);

/**
 * Validates the env based on flags.
 * @param {Object} env - env object to validate
 **/
const validateEnv = (env) => {
  return EnvSchema.validate(env);
};

module.exports = {
  validateEnv,
};
