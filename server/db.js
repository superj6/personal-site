const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');

mkdirp.sync('./var/db');
const db = new sqlite3.Database('./var/db/todos.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY, 
    slug BLOB, 
    username TEXT,
    date DATE, 
    content TEXT
  )`);
});

module.exports = db;
