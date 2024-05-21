
const db = require('../db');

function fixRawComment(comment){
  comment.date = new Date(comment.date);
  return comment;
}

function getComments(slug, cb){
  db.all('SELECT slug,username,date,content FROM comments WHERE slug = ?', [slug], 
    (e, comments) => cb(e, comments.map(fixRawComment)));
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
  addComment: addComment
};
