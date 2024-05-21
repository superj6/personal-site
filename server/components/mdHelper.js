const parseMd = require('parse-md').default;
const markdownIt = require('markdown-it');
const mdAnchor = require('markdown-it-anchor');
const mdDompurify = require('markdown-it-dompurify');

const slugify = (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));

function mdRender(useAnchor){
  let md = new markdownIt();
  md.use(mdDompurify);
  if(useAnchor) md.use(mdAnchor, {slugify, tabIndex: false});
  return md;
}

module.exports = {
  mdRender: mdRender,
  parseMd: parseMd,
  slugify: slugify
};
