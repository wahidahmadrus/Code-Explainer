import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

jest.setTimeout(300000);

process.env.JWT_SECRET = "test_jwt_secret_for_backend_tests";
process.env.GROQ_API_KEY = "test_groq_key";
process.env.GROQ_BASE_URL = "https://api.groq.com/openai/v1";
process.env.GROQ_MODEL = "llama-3.3-70b-versatile";
process.env.MONGOMS_DISTRO = "ubuntu-22.04";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "7.0.14",
    },
  });

  await mongoose.connect(mongoServer.getUri());
}, 300000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});
