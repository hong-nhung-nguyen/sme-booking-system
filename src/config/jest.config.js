module.exports = {
    rootDir: "../../",
    testEnvironment: "node",
    // run files ending in .test.js inside the tests/ folder
    testMatch: ["**/tests/**/*.test.js"],
    // to run test just for a file: npm test -- tests/models/floorPlan.model.test.js
    clearMocks: true
};