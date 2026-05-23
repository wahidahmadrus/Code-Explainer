import request from "supertest";
import app from "../src/server.js";

async function signupUser(email) {
  const response = await request(app).post("/api/auth/signup").send({
    name: "Test User",
    email,
    password: "password123",
  });

  return response.body.token;
}

function snippetPayload(overrides = {}) {
  return {
    title: "Console log example",
    language: "JavaScript",
    code: "console.log('Hello world')",
    explanation: {
      summary: "This prints Hello world.",
      concepts: ["console"],
    },
    mode: "explain",
    ...overrides,
  };
}

async function saveSnippet(token, overrides = {}) {
  return request(app)
    .post("/api/snippets")
    .set("Authorization", `Bearer ${token}`)
    .send(snippetPayload(overrides));
}

describe("Snippet routes", () => {
  test("rejects saving snippet without token", async () => {
    const response = await request(app).post("/api/snippets").send(snippetPayload());

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Log in to continue.");
  });

  test("saves snippet with valid token", async () => {
    const token = await signupUser("save@example.com");
    const response = await saveSnippet(token);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Console log example",
      language: "JavaScript",
      code: "console.log('Hello world')",
      mode: "explain",
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  test("gets only logged-in user's snippets", async () => {
    const firstToken = await signupUser("first@example.com");
    const secondToken = await signupUser("second@example.com");

    await saveSnippet(firstToken, { title: "First user's snippet" });
    await saveSnippet(secondToken, { title: "Second user's snippet" });

    const response = await request(app).get("/api/snippets").set("Authorization", `Bearer ${firstToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("First user's snippet");
  });

  test("gets one snippet by id", async () => {
    const token = await signupUser("one@example.com");
    const createResponse = await saveSnippet(token, { title: "Single snippet" });

    const response = await request(app)
      .get(`/api/snippets/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Single snippet");
  });

  test("deletes user's own snippet", async () => {
    const token = await signupUser("delete@example.com");
    const createResponse = await saveSnippet(token);

    const deleteResponse = await request(app)
      .delete(`/api/snippets/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(204);

    const listResponse = await request(app).get("/api/snippets").set("Authorization", `Bearer ${token}`);
    expect(listResponse.body).toHaveLength(0);
  });

  test("does not allow deleting another user's snippet", async () => {
    const ownerToken = await signupUser("owner@example.com");
    const otherToken = await signupUser("other@example.com");
    const createResponse = await saveSnippet(ownerToken);

    const deleteResponse = await request(app)
      .delete(`/api/snippets/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(deleteResponse.status).toBe(404);

    const ownerListResponse = await request(app).get("/api/snippets").set("Authorization", `Bearer ${ownerToken}`);
    expect(ownerListResponse.body).toHaveLength(1);
  });
});

