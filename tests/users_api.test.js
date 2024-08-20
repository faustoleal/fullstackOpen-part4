const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const User = require("../models/users");
const supertest = require("supertest");
const app = require("../app");
const { deleteMany } = require("../models/users");
const api = supertest(app);

const initialUsers = [
  {
    _id: "6695c232eeb8fd4c9625042e",
    username: "hellas",
    name: "Arto Hellas",
    passwordHash:
      "$2b$10$bwfao1EHkDjkkkztI9j0nuyhtYBs8Onx4Nq8b3abczRXaGhfoINmW",
    __v: 0,
  },
  {
    _id: "6695c24deeb8fd4c96250432",
    username: "lovelace",
    name: "Ada Lovelace",
    passwordHash:
      "$2b$10$B2G7VQOpHqCfOLiE5zw0lOOVTKuYVEYLiTiXzegcmdLuiP4y/CCd2",
    __v: 0,
  },
  {
    _id: "6695c27deeb8fd4c96250434",
    username: "abramov",
    name: "Dan Abramov",
    passwordHash:
      "$2b$10$UjEgj0E7KybxiuphLr/b0uPsOPb4V4WIwDeC3yvekNOfPtHrZl9YC",
    __v: 0,
  },
  {
    _id: "6695c2a8eeb8fd4c96250436",
    username: "poppendieck",
    name: "Mary Poppendieck",
    passwordHash:
      "$2b$10$UD5KVGuqERAD26ekM0BSVOZWGirt6vETDgebPZJdP5G34LzKIVj1.",
    __v: 0,
  },
];

beforeEach(async () => {
  await User.deleteMany({});

  for (let user of initialUsers) {
    let userObject = new User(user);
    await userObject.save();
  }
});

describe("get users", () => {
  test("users are returned as json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are 4 users", async () => {
    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, 4);
  });

  test("includes id", async () => {
    const response = await api.get("/api/users");
    const contents = response.body.map((r) => r.id);

    assert(contents.includes("6695c232eeb8fd4c9625042e"));
  });
});

describe("adding a new user", () => {
  test("new user", async () => {
    const newUser = {
      username: "lima",
      name: "Pedro Lima",
      password: "lima2024",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/users");

    const contents = response.body.map((r) => r.username);

    assert.strictEqual(response.body.length, initialUsers.length + 1);

    assert(contents.includes("lima"));
  });

  test("user without username", async () => {
    const newUser = {
      name: "Pedro Lima",
      password: "lima2024",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, initialUsers.length);
  });

  test("user with username.length shorter that 3", async () => {
    const newUser = {
      username: "pe",
      name: "Pedro Lima",
      password: "lima2024",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, initialUsers.length);
  });

  test("user without password", async () => {
    const newUser = {
      username: "lima",
      name: "Pedro Lima",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, initialUsers.length);
  });

  test("user with password.length shorter that 3", async () => {
    const newUser = {
      username: "lima",
      name: "Pedro Lima",
      password: "li",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, initialUsers.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
