import request from "supertest";
import app from "../src/server.js";

const validUser = {
  name: "Wahid",
  email: "wahid@example.com",
  password: "password123",
};

async function createUser(overrides = {}) {
  return request(app)
    .post("/api/auth/signup")
    .send({
      ...validUser,
      ...overrides,
    });
}

describe("Auth routes", () => {
  test("signup creates a user and returns token", async () => {
    const response = await createUser();

    expect(response.status).toBe(201);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      name: validUser.name,
      email: validUser.email,
      role: "user",
    });
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test("signup rejects missing fields", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      email: "missing@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("name is required");
  });

  test("signup rejects duplicate email", async () => {
    await createUser();
    const response = await createUser();

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("An account with this email already exists.");
  });

  test("login returns token for correct credentials", async () => {
    await createUser();

    const response = await request(app).post("/api/auth/login").send({
      email: validUser.email,
      password: validUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe(validUser.email);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test("login rejects wrong password", async () => {
    await createUser();

    const response = await request(app).post("/api/auth/login").send({
      email: validUser.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Email or password is incorrect.");
  });

  test("/api/auth/me rejects request without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Log in to continue.");
  });

  test("/api/auth/me returns current user with valid token", async () => {
    const signupResponse = await createUser();

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${signupResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: validUser.email,
      name: validUser.name,
      role: "user",
    });
    expect(response.body.user.passwordHash).toBeUndefined();
  });
});

