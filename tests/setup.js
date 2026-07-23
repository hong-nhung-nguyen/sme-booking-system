const {
    connectTestDb,
    clearTestDb,
    closeTestDb
} = require("./setUp/testDb");

// The MongoDB lifecycle is needed by model tests only. Unit tests (such as
// intentParser.service.test.js) must not start a MongoDB process.
const isModelTest = expect.getState().testPath.includes("\\tests\\models\\");

if (isModelTest) {
    beforeAll(async () => {
        await connectTestDb();
    });

    afterEach(async () => {
        await clearTestDb();
    });

    afterAll(async () => {
        await closeTestDb();
    });
}
