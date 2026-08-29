const crypto = require('crypto');

// Secret used to sign form timestamps. Falls back to a per-process random
// secret, which just means tokens from before a restart are rejected.
const secret = process.env.COMMENT_SECRET || crypto.randomBytes(32).toString('hex');

const MIN_FILL_MS = 4 * 1000;          // humans take longer than this to write a comment
const MAX_FILL_MS = 24 * 60 * 60 * 1000; // don't accept a token from a stale tab forever

function sign(ts){
  return crypto.createHmac('sha256', secret).update(String(ts)).digest('hex').slice(0, 32);
}

// Signed timestamp embedded in the comment form when the page is rendered.
function makeToken(){
  const ts = Date.now();
  return `${ts}.${sign(ts)}`;
}

// Rejects missing/forged tokens, and forms submitted implausibly fast.
function checkToken(token){
  if(typeof token !== 'string') return 'missing token';
  const [ts, sig] = token.split('.');
  if(!ts || !sig) return 'malformed token';
  const expected = sign(ts);
  if(sig.length !== expected.length || 
     !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return 'bad token signature';
  const age = Date.now() - Number(ts);
  if(age < MIN_FILL_MS) return `submitted too fast (${age}ms)`;
  if(age > MAX_FILL_MS) return 'token expired';
  return null;
}

// Hidden field that humans never see; bots auto-fill every input they find.
function checkHoneypot(value){
  return value ? 'honeypot filled' : null;
}

// Cloudflare Turnstile server-side verification. Skipped when not configured.
async function checkTurnstile(token, ip){
  const key = process.env.TURNSTILE_SECRET_KEY;
  if(!key) return null;
  if(!token) return 'missing turnstile token';
  try{
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({secret: key, response: token, remoteip: ip})
    });
    const data = await res.json();
    return data.success ? null : `turnstile failed: ${(data['error-codes'] || []).join(',')}`;
  }catch(e){
    // Cloudflare unreachable: fail open so a real commenter isn't blocked by an outage.
    console.error('turnstile verify error', e.message);
    return null;
  }
}

// Akismet spam classification. Skipped when not configured.
async function checkAkismet(comment, req){
  const key = process.env.AKISMET_KEY;
  if(!key) return null;
  const params = new URLSearchParams({
    blog: process.env.AKISMET_BLOG || `${req.protocol}://${req.get('host')}`,
    user_ip: req.ip,
    user_agent: req.get('user-agent') || '',
    referrer: req.get('referer') || '',
    permalink: `${req.protocol}://${req.get('host')}${req.query.redirect || ''}`,
    comment_type: 'comment',
    comment_author: comment.username,
    comment_content: comment.content,
    comment_date_gmt: comment.date.toISOString(),
    blog_lang: 'en',
    blog_charset: 'UTF-8'
  });
  try{
    const res = await fetch(`https://${key}.rest.akismet.com/1.1/comment-check`, {
      method: 'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: params.toString()
    });
    const text = (await res.text()).trim();
    if(text === 'true') return `akismet: spam${res.headers.get('x-akismet-pro-tip') === 'discard' ? ' (discard)' : ''}`;
    if(text === 'false') return null;
    console.error('akismet unexpected response', text, res.headers.get('x-akismet-debug-help'));
    return null; // fail open
  }catch(e){
    console.error('akismet error', e.message);
    return null;
  }
}

module.exports = {
  makeToken: makeToken,
  checkToken: checkToken,
  checkHoneypot: checkHoneypot,
  checkTurnstile: checkTurnstile,
  checkAkismet: checkAkismet
};
