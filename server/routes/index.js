const express = require('express');
const path = require('path');


const mdHelper = require('../components/md')
const blogHelper = require('../components/blog')
const commentHelper = require('../components/comments');
const resumeHelper = require('../components/resume.js');

const router = express.Router();

router.use('/static', express.static(path.resolve(__dirname, '../../client/static')));

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/resume', (req, res) => {
  resumeHelper.getResume((e, resume) => {
    res.render('resume', {md: mdHelper.mdRender(false), resume: resume});
  });
});

router.get('/projects', (req, res) => {
  res.send('projects');
});

router.get('/blog', (req, res) => {
  blogHelper.getBlogs((blogs) => {
    res.render('blog', {md: mdHelper.mdRender(false), blogs: blogs});
  });
});

router.get('/blog/:slug', (req, res, next) => {
  blogHelper.getBlog(req.params.slug, (e, blog) => {
    if(e) next();
    commentHelper.getComments(blog.meta.commentsSlug, (e, comments) => {	
      res.render('blog-post', {
	md: mdHelper.mdRender(false),
	mdAnc: mdHelper.mdRender(true),
	slugify: mdHelper.slugify, 
	blog: blog,
	comments: comments
      });
    });	
  });
});

router.get('/blog/*', (req, res) => {
  res.redirect('/blog');
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
