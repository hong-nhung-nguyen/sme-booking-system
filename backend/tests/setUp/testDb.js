const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectTestDb = async () => {
  mongoServer = await MongoMemoryServer.create();

  try {
    await mongoose.connect(mongoServer.getUri());
  } catch (error) {
    await mongoServer.stop();
    mongoServer = undefined;
    throw error;
  }
};

const clearTestDb = async () => {
  if (mongoose.connection.readyState !== 1) return;

  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
};

const closeTestDb = async () => {
  try {
    // `0` means disconnected: do not call dropDatabase in that state.
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = undefined;
    }
  }
};

module.exports = { connectTestDb, clearTestDb, closeTestDb };