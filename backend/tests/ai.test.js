import { jest } from "@jest/globals";
import request from "supertest";

const mockedExplanation = {
  summary: "This code prints Hello world.",
  lineByLine: ["console.log displays text in the console."],
  concepts: ["console", "string"],
  mistakes: [],
  improvedCode: "",
};

const mockedGeneratedCode = {
  code: "console.log('Hello world');",
  explanation: "This code prints a message to the console.",
  concepts: ["console", "output"],
};

jest.unstable_mockModule("../src/services/ai.service.js", () => ({
  explainCodeWithAI: jest.fn(async () => mockedExplanation),
  generateCodeWithAI: jest.fn(async () => mockedGeneratedCode),
}));

const app = (await import("../src/server.js")).default;
const { explainCodeWithAI, generateCodeWithAI } = await import("../src/services/ai.service.js");

describe("AI routes", () => {
  beforeEach(() => {
    explainCodeWithAI.mockClear();
    generateCodeWithAI.mockClear();
  });

  test("explain rejects missing language", async () => {
    const response = await request(app).post("/api/ai/explain").send({
      code: "console.log('Hello world')",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("language is required");
    expect(explainCodeWithAI).not.toHaveBeenCalled();
  });

  test("explain rejects missing code", async () => {
    const response = await request(app).post("/api/ai/explain").send({
      language: "JavaScript",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("code is required");
    expect(explainCodeWithAI).not.toHaveBeenCalled();
  });

  test("explain returns mocked explanation for valid input", async () => {
    const response = await request(app).post("/api/ai/explain").send({
      language: "JavaScript",
      code: "console.log('Hello world')",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedExplanation);
    expect(explainCodeWithAI).toHaveBeenCalledWith("JavaScript", "console.log('Hello world')");
  });

  test("generate rejects missing language", async () => {
    const response = await request(app).post("/api/ai/generate").send({
      instruction: "Print Hello world",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("language is required");
    expect(generateCodeWithAI).not.toHaveBeenCalled();
  });

  test("generate rejects missing instruction", async () => {
    const response = await request(app).post("/api/ai/generate").send({
      language: "JavaScript",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("instruction is required");
    expect(generateCodeWithAI).not.toHaveBeenCalled();
  });

  test("generate returns mocked generated code for valid input", async () => {
    const response = await request(app).post("/api/ai/generate").send({
      language: "JavaScript",
      instruction: "Print Hello world",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedGeneratedCode);
    expect(generateCodeWithAI).toHaveBeenCalledWith("JavaScript", "Print Hello world");
  });
});

