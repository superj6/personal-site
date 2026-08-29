const parseMd = require('parse-md').default;
const markdownIt = require('markdown-it');
const mdAnchor = require('markdown-it-anchor');
const mdDompurify = require('markdown-it-dompurify');

const slugify = (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));

// Marks every link as user-generated so search engines give it no ranking
// credit — removes the whole reason link spam exists.
function ugcLinks(md){
  const defaultRender = md.renderer.rules.link_open || 
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('rel', 'nofollow ugc noopener');
    return defaultRender(tokens, idx, options, env, self);
  };
}

function mdRender(usePurify, useAnchor, useUgcLinks){
  let md = new markdownIt('commonmark');
  if(usePurify) md.use(mdDompurify);
  if(useAnchor) md.use(mdAnchor, {slugify, tabIndex: false});
  if(useUgcLinks) md.use(ugcLinks);
  return md;
}

module.exports = {
  mdRender: mdRender,
  parseMd: parseMd,
  slugify: slugify
};
