const express = require('express');
const path = require('path');

const commentHelper = require('../components/comments');

const router = express.Router();

router.post('/addcomment', (req, res) => {
  commentHelper.addComment({
    slug: req.body.slug,
    username: req.body.username,
    date: new Date(),
    content: req.body.content
  }, (e) => {
    if(req.query.redirect) res.redirect(req.query.redirect);
  });
});

module.exports = router;
