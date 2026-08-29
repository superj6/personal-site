const db = require('../db');

// Never render more than this many comments on one page, so a flood can't
// take the server down again.
const MAX_RENDERED = 100;

function fixRawComment(comment){
  comment.date = new Date(comment.date);
  return comment;
}

// cb(err, {comments, total}) — comments are the newest MAX_RENDERED.
function getComments(slug, cb){
  db.get('SELECT COUNT(*) AS total FROM comments WHERE slug = ?', [slug], (e, row) => {
    if(e) return cb(e);
    db.all('SELECT slug,username,date,content FROM comments WHERE slug = ? ORDER BY date DESC LIMIT ?', 
      [slug, MAX_RENDERED], 
      (e, comments) => {
        if(e) return cb(e);
        cb(null, {comments: comments.map(fixRawComment), total: row.total});
      });
  });
}

function addComment(comment, cb){
  db.run('INSERT INTO comments (slug, username, date, content) VALUES (?, ?, ?, ?)', 
    [
      comment.slug,
      comment.username,
      comment.date,
      comment.content
    ], cb);
}

module.exports = {
  getComments: getComments,
  addComment: addComment,
  MAX_RENDERED: MAX_RENDERED
};
