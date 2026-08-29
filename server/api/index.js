const express = require('express');
const rateLimit = require('express-rate-limit');

const commentHelper = require('../components/comments');
const blogHelper = require('../components/blog');
const spam = require('../components/spam');

const router = express.Router();

const MAX_USERNAME = 40;
const MAX_CONTENT = 250;

// Hard cap on how fast one IP can even attempt to comment.
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => rejectComment(req, res, 'rate limited')
});

// Bots get the same redirect as a success so they can't tell what tripped.
// Humans get a query flag so the page can show a short "not posted" note.
function rejectComment(req, res, reason){
  console.log(`comment rejected (${reason}) ip=${req.ip} name=${JSON.stringify(req.body && req.body.username)}`);
  const [pathAndQuery, hash] = safeRedirect(req.query.redirect).split('#');
  const sep = pathAndQuery.includes('?') ? '&' : '?';
  res.redirect(`${pathAndQuery}${sep}commentError=1${hash ? `#${hash}` : ''}`);
}

// Only allow same-site relative redirects.
function safeRedirect(target){
  if(typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) return '/';
  return target;
}

function knownCommentSlugs(){
  return new Promise((resolve) => {
    blogHelper.getBlogs((blogs) => resolve(new Set(blogs.map((b) => b.meta.commentsSlug).filter(Boolean))));
  });
}

router.post('/addcomment', commentLimiter, async (req, res) => {
  const body = req.body || {};
  const comment = {
    slug: String(body.slug || ''),
    username: String(body.username || '').trim(),
    date: new Date(),
    content: String(body.content || '').replace(/\r\n/g, '\n').trim()
  };

  // Cheap local checks first.
  let reason = null;
  if(!comment.username || comment.username.length > MAX_USERNAME) reason = 'bad username';
  else if(!comment.content || comment.content.length > MAX_CONTENT) reason = 'bad content length';
  else if(!(await knownCommentSlugs()).has(comment.slug)) reason = 'unknown slug';
  else reason = spam.checkHoneypot(body.website) || spam.checkToken(body._t);
  if(reason) return rejectComment(req, res, reason);

  // Then the external ones (each is a no-op when its key isn't configured).
  reason = await spam.checkTurnstile(body['cf-turnstile-response'], req.ip);
  if(reason) return rejectComment(req, res, reason);
  reason = await spam.checkAkismet(comment, req);
  if(reason) return rejectComment(req, res, reason);

  commentHelper.addComment(comment, (e) => {
    if(e) console.error('addComment failed', e);
    res.redirect(safeRedirect(req.query.redirect));
  });
});

module.exports = router;
