const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname, '../..'),

    testEnvironment: 'node',
    testRegex: 'tests/.*\.test\.js$',
    testPathIgnorePatterns: ['/node_modules/'],
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