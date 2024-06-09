const Joi = require("joi");

const EnvSchema = Joi.object()
  .keys({
    CLIENT_URL: Joi.string().uri().required(),
    SERVER_DOMAIN: Joi.string().required(),
    PORT: Joi.alternatives(
      Joi.string().regex(/^\d+$/),
      Joi.number()
    ).required(),
    EMAIL_HOST: Joi.string().hostname().required(),
    EMAIL_SERVICE: Joi.string().required(),
    EMAIL_PORT: Joi.alternatives(
      Joi.string().regex(/^\d+$/),
      Joi.number()
    ).required(),
    EMAIL_USER: Joi.string().email().required(),
    EMAIL_PASS: Joi.string().required(),
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
    FIRESTORE_PROJECT_ID: Joi.string().required(),
    FIRESTORE_PRIVATE_KEY: Joi.string().required(),
    FIRESTORE_PRIVATE_ID: Joi.string().required(),
    FIRESTORE_CLIENT_EMAIL: Joi.string().required(),
    FIRESTORE_CLIENT_ID: Joi.string().required(),
    FIRESTORE_TOKEN_URI: Joi.string().required(),
    FIRESTORE_AUTH_PROVIDER: Joi.string().required(),
    FIRESTORE_CLIENT_CERT: Joi.string().required(),
    UNIVERSE_DOMAIN: Joi.string().required(),
    FIRESTORE_AUTH_URI: Joi.string().required(),
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
