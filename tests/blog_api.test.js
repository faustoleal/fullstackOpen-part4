const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const { deleteMany } = require("../models/blogs");
const Blog = require("../models/blogs");

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
    user: "6695c27deeb8fd4c96250434",
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

describe("get blogs", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("there are 6 blogs", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body.length).toBe(initialBlogs.length);
  });

  test("includes id", async () => {
    const response = await api.get("/api/blogs");
    const contents = response.body.map((r) => r.id);

    expect(contents).toContainEqual("5a422b3a1b54a676234d17f9");
  });
});

describe("adding a new blog", () => {
  test("invalid token", async () => {
    const newBlog = {
      title: "New Blog",
      author: "Pedro Lima",
      url: "https://makingtest.com",
      likes: 8,
    };

    await api
      .post("/api/blogs")
      .set(
        "Authorization",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMjI2NTMxMH0.Jyfjxp1Bag5CF0fK9cvzlYbiFvABd6Ux9OMJar_dXYo"
      )
      .send(newBlog)
      .expect(401);
  });

  test("new blog", async () => {
    const newBlog = {
      title: "New Blog",
      author: "Pedro Lima",
      url: "https://makingtest.com",
      likes: 8,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMjI2NTMxMH0.Jyfjxp1Bag5CF0fK9cvzlYbiFvABd6Ux9OMJar_dXYo"
      )
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");
    expect(response.body.length).toBe(initialBlogs.length + 1);

    const contents = response.body.map((r) => r.title);
    expect(contents).toContainEqual("New Blog");
  });

  test("without likes", async () => {
    const newBlog = {
      title: "New Blog",
      author: "Pedro Lima",
      url: "https://makingtest.com",
    };

    await api
      .post("/api/blogs")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMTI2MDQ3N30.mQWdYtInZqCWFSTNbU6x4OfFUCY0KRrDuPBNYvtdTZc"
      )
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const response = await api.get("/api/blogs");

    const contents = response.body[6];

    expect(contents.likes).toBe(0);
  });

  test("blog without title is not added", async () => {
    const newBlog = {
      author: "Pedro Lima",
      url: "https://makingtest.com",
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMTI2MDQ3N30.mQWdYtInZqCWFSTNbU6x4OfFUCY0KRrDuPBNYvtdTZc"
      )
      .send(newBlog)
      .expect(400);

    const response = await api.get("/api/blogs");

    expect(response.body.length).toBe(initialBlogs.length);
  });

  test("blog without author is not added", async () => {
    const newBlog = {
      title: "New Blog",
      url: "https://makingtest.com",
      likes: 2,
    };

    await api
      .post("/api/blogs")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMTI2MDQ3N30.mQWdYtInZqCWFSTNbU6x4OfFUCY0KRrDuPBNYvtdTZc"
      )
      .send(newBlog)
      .expect(400);

    const response = await api.get("/api/blogs");

    expect(response.body.length).toBe(initialBlogs.length);
  });
});

describe("delete and update blogs", () => {
  test("delete blog", async () => {
    const response = await api.get("/api/blogs");
    const blogsAtStart = response.body;
    const blogToDelete = await blogsAtStart[5];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMjM1MjUxNn0.-JQCCEV9L-KzONHtSTAhE1B-0O7gqHY4bybnyNjQ-E8"
      )
      .expect(200);

    const res = await api.get("/api/blogs");
    const blogsAtEnd = res.body;

    expect(blogsAtEnd.length).toBe(initialBlogs.length - 1);
    expect(blogsAtEnd).not.toContainEqual(blogToDelete);
  });

  test("update blog", async () => {
    const response = await api.get("/api/blogs");
    const blogToUpdate = response.body[0];

    const update = {
      likes: 11,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFicmFtb3YiLCJpZCI6IjY2OTVjMjdkZWViOGZkNGM5NjI1MDQzNCIsImlhdCI6MTcyMTI2MDQ3N30.mQWdYtInZqCWFSTNbU6x4OfFUCY0KRrDuPBNYvtdTZc"
      )
      .send(update)
      .expect(200);

    const updateBlogs = await api.get("/api/blogs");
    const contents = updateBlogs.body.map((r) => r.likes);

    expect(contents).toContainEqual(11);
    expect(contents[0]).not.toContainEqual(blogToUpdate);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
