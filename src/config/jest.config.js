module.exports = {
    rootDir: '../..',

    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    collectCoverageFrom: [
    '<rootDir>/src/services/ai/intentParser.service.js',
    ],

    coverageThreshold: {
    global: {
        lines: 85,
        functions: 70,
        branches: 60,
    },
    },
};