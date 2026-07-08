require("dotenv").config();

module.exports = {
  mongodb: {
    url: process.env.MONGO_URL,
    databaseName: process.env.MONGO_DB_NAME,
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  moduleSystem: "commonjs",
};
