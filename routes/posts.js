const express = require('express');
const router = express.Router();

// Fake in-memory "database"
let posts = [];

// GET all posts
router.get('/', (req, res) => {
  res.json(posts);
});

// POST a new blog post
router.post('/', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newPost = {
    id: posts.length + 1,
    title,
    content,
    createdAt: new Date()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

module.exports = router;

// use example in Postman:
// POST http://localhost:3300/posts

// Body:
// {
//  "title": "The First Park Blogpost",
//  "content": "This is the content of the blog post. Hooray!"
// }