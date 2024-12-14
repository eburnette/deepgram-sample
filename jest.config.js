module.exports = {
  // Other Jest configuration options
  testEnvironment: "node", // Use node test environment for Jest
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Run this setup file after Jest has been configured
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  testMatch: ["**/*.test.js"], // Match test files ending with .test.js in any subdirectory
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy"
  },
  testTimeout: 10000 // Increase the timeout to allow for network requests
};