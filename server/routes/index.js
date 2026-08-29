const express = require('express');
const path = require('path');


const mdHelper = require('../components/md');
const blogHelper = require('../components/blog');
const projectsHelper = require('../components/projects');
const commentHelper = require('../components/comments');
const spam = require('../components/spam');
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
    res.render('resume', {md: mdHelper.mdRender(false, false), resume: resume});
  });
});

router.get('/projects', (req, res) => {
  projectsHelper.getProjects((projects) => {
    res.render('projects', {projects: projects});
  });
});

router.get('/blog', (req, res) => {
  blogHelper.getBlogs((blogs) => {
    res.render('blog', {md: mdHelper.mdRender(false, false), blogs: blogs});
  });
});

router.get('/blog/:slug', (req, res, next) => {
  blogHelper.getBlog(req.params.slug, (e, blog) => {
    if(e) return next();
    commentHelper.getComments(blog.meta.commentsSlug, (e, result) => {
      if(e) return next(e);
      res.render('blog-post', {
	md: mdHelper.mdRender(true, false, true),
	mdAnc: mdHelper.mdRender(false, true),
	slugify: mdHelper.slugify, 
	blog: blog,
	comments: result.comments,
	commentsTotal: result.total,
	commentToken: spam.makeToken(),
	commentError: Boolean(req.query.commentError)
      });
    });	
  });
});

router.get('/blog/*', (req, res) => {
  res.redirect('/blog');
});

router.get('*', (req, res) => {
  res.redirect('/');
});

module.exports = router;
