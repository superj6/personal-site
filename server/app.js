const express = require('express');
const http = require('http');
const path = require('path');
require('dotenv').config();

const routes = require('./routes')

const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

app.set('views', path.resolve(__dirname, '../client/views'));
app.set('view engine', 'ejs');

app.use(routes);

server.listen(port, () => {
  console.log(`Personal-site listening on port ${port}`)
});
