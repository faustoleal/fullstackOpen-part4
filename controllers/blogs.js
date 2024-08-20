const blogsRouter = require("express").Router();
const Blog = require("../models/blogs");
const middleware = require("../utils/middelware");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.put("/:id", middleware.userExtractor, async (request, response) => {
  const { likes } = request.body;

  const updateBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );

  const updatedBlog = await updateBlog.populate("user", {
    username: 1,
    name: 1,
  });

  response.json(updatedBlog);
});

blogsRouter.post(
  "/",
  middleware.userExtractor,
  async (request, response, next) => {
    const body = request.body;

    const user = request.user;

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    });

    try {
      const createdBlog = await blog.populate("user", {
        username: 1,
        name: 1,
      });
      const savedBlog = await createdBlog.save();
      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
      response.status(201).json(savedBlog);
    } catch (error) {
      next(error);
    }
  }
);

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user;

    const blog = await Blog.findById(request.params.id);

    if (!request.token || user.id.toString() !== blog.user.toString()) {
      return response.status(400).json({
        error: "You are not the author of the post, so you can not delete it",
      });
    }
    await Blog.findByIdAndDelete(request.params.id);
    response.json(blog);
    response.status(200).end();
  }
);

module.exports = blogsRouter;
