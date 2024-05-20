const express = require('express');
const path = require('path');

const blogHelper = require('../components/blog')

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
  let tempComments = [
    {
      author: 'jason', 
      date: new Date(1995, 11, 17), 
      content: '# clown\n wow this is dumb comment'
    },
    {
      author: 'bob',
      date: new Date(1995, 11, 18),
      content: 'A longer comment.\n\n ## wow look at this! \n\nisnt my comment so cool lol'
    }
  ];
  blogHelper.getBlog(req.params.slug, (blog) => {
    res.render('blog-post', {
      md: blogHelper.mdRender(false),
      mdAnc: blogHelper.mdRender(true),
      slugify: blogHelper.slugify, 
      blog: blog,
      comments: tempComments
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
