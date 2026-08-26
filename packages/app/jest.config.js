module.exports = {
  preset: "@shelf/jest-mongodb",
  watchPathIgnorePatterns: ["globalConfig"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Mock otplib to avoid ES module issues
    "^otplib$": "<rootDir>/__mocks__/otplib.js",
  },
};
