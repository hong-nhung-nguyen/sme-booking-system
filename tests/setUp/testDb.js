const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectTestDb = async () => {
    // create a temporary fake database
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
};

const clearTestDb = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        // for afterEach(): clearing all documents after every test
        // so the next test start with an empty database 
        await collections[key].deleteMany({});
    }
};

const closeTestDb = async () => {
    // delete the whole test db (all collections & documents)
    await mongoose.connection.dropDatabase();
    // close the connection with mongodb
    await mongoose.connection.close();

    if (mongoServer) {
        // stop the fake mongodb server
        await mongoServer.stop();
    }
};

module.exports = { connectTestDb, clearTestDb, closeTestDb };