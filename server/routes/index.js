const express = require('express');
const path = require('path');

const blogHelper = require('../components/blog')
const commentHelper = require('../components/comments');

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
  blogHelper.getBlogs((blogs) => {
    res.render('blog', {md: blogHelper.mdRender(false), blogs: blogs});
  });
});

router.get('/blog/:slug', (req, res) => {
  blogHelper.getBlog(req.params.slug, (blog) => {
    commentHelper.getComments(blog.meta.commentsSlug, (e, comments) => {
      res.render('blog-post', {
	md: blogHelper.mdRender(false),
	mdAnc: blogHelper.mdRender(true),
	slugify: blogHelper.slugify, 
	blog: blog,
	comments: comments
      });
    });	
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
