const {
    connectTestDb,
    clearTestDb,
    closeTestDb
} = require("./setUp/testDb");

beforeAll(async () => {
    await connectTestDb();
});

afterEach(async () => {
    await clearTestDb();
});

afterAll(async () => {
    await closeTestDb();
});