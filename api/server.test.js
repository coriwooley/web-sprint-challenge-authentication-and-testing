const db = require("../data/dbConfig");
const server = require("./server");
const request = require("supertest");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
  await db("users").insert([
    {
      username: "Vecna",
      password: "$2a$08$kI93ZVK9JymSkf1RxYa22OmgVDJCN/A75S9ufUr1/gG2J0n38zeSy",
    },
    {
      username: "Eleven",
      password: "$2a$08$8sOpybC0YFbZAZqqbaxfw.xKqYQwq5CEwrI0TdKbhoG.IXleuk53.",
    },
    {
      username: "Demogorgon",
      password: "$2a$08$WiN0ZaqQweA3sRz7PLbG9e6fhhOuAo5ZmVkv1QlFML3CowSXhfCBy",
    },
  ]);
});

afterAll(async () => {
  await db.destroy();
});

describe("Endpoints", () => {
  describe("Post /login", () => {
    const loginUrl = "/api/auth/login";
    test("User can login", async () => {
      const login = await request(server)
        .post(loginUrl)
        .send({ username: "Vecna", password: "foo" });
      expect(login.body.message).toBe(`welcome, Vecna`);
    });
    test("sends proper error message if username or password is missing", async () => {
      const login = await request(server)
        .post(loginUrl)
        .send({ username: "", password: "" });
      expect(login.body.message).toBe("username and password required");
    });
    test("if username doesnt exist, responds with proper error message", async () => {
      const login = await request(server)
        .post(loginUrl)
        .send({ username: "Will", password: "333" });
      expect(login.body.message).toBe("invalid credentials");
      expect(login.status).toBe(401);
    });
    test("if password is incorrect, responds with proper error message", async () => {
      const login = await request(server)
        .post(loginUrl)
        .send({ username: "Demogorgon", password: "333" });
      expect(login.body.message).toBe("invalid credentials");
      expect(login.status).toBe(401);
    });
  });

  describe("Post /register", () => {
    const registerUrl = "/api/auth/register";
    test("Can successfully create a new user", async () => {
      await request(server)
        .post(registerUrl)
        .send({ username: "Hopper", password: "333" });
      const user = await db("users").where("username", "Hopper").first();
      expect(user).toMatchObject({ username: "Hopper" });
    });
    test("If username is taken, responds with correct error message & new user not created", async () => {
      const register = await request(server)
        .post(registerUrl)
        .send({ username: "Eleven", password: "333" });
      expect(register.body.message).toBe("username taken");
      const users = await db("users");
      expect(users).toHaveLength(3);
    });
    test("if new user is created, responds with proper status code", async () => {
      const register = await request(server)
        .post(registerUrl)
        .send({ username: "Nancy", password: "333" });
      expect(register.status).toBe(201);
    });
  });

  describe("Get /jokes", () => {
    test("responds with proper error message if token is missing", async () => {
      const jokes = await request(server).get("/api/jokes");
      expect(jokes.body.message).toBe("Token is required");
      expect(jokes.status).toBe(401);
    });
    test("responds with dad jokes", async () => {
      const jokes = await request(server)
        .post("/api/auth/login")
        .send({ username: "Vecna", password: "foo" });
      const result = await request(server)
        .get("/api/jokes")
        .set("Authorization", jokes.body.token);
      expect(result.body).toHaveLength(3);
      expect(result.body).toBeInstanceOf(Array);
    });
  });
});
