const dummy = (blogs) => {
  return (blogs = 1);
};

const totalLikes = (blogs) => {
  //console.log(blogs.length);
  //console.log(blogs.likes);

  const array = blogs.map((el) => el.likes);

  // console.log(array);

  const reducer = (sum, item) => {
    return sum + item;
  };

  return blogs.length === 1 ? blogs[0].likes : array.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  blogs.sort((a, b) => b.likes - a.likes);

  return blogs[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
