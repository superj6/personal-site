const express = require('express');
const path = require('path');

const blog = require('../components/blog')

const router = express.Router();

router.use('/static', express.static(path.resolve(__dirname, '../../client/static')));

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/resume', (req, res) => {
  res.send('resume');
});

router.get('/projects', (req, res) => {
  res.send('projects');
});

router.get('/blog', (req, res) => {
  blog.getBlogs((blogs) => {
    res.render('blog', {blogs: blogs});
  });
});

router.get('/blog/:slug', (req, res) => {
  blog.getBlog(req.params.slug, (blog) => {
    res.send(blog.content);
  });
});

router.get('/problems', (req, res) => {
  res.send('problems');
});

router.get('/log', (req, res) => {
  res.send('log');
});

router.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = router;
