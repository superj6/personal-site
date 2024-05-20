const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const parseMd = require('parse-md').default;


const md = markdownIt();
const blogPath = path.resolve(__dirname, '../../client/blog-posts');

function getBlog(slug, cb){
  const filePath = path.join(blogPath, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const parsed = parseMd(fileContents);

  const blog = {
    slug: slug, 
    meta: parsed.metadata,
    preview: md.render(parsed.content.split('[cut]::')[0]),
    content: md.render(parsed.content)
  };

  cb(blog);
}

function getBlogs(cb){
  fs.readdir(blogPath, (err, files) => {
    let blogs = [];
    files.forEach(file => {
      try{
	const slug = file.split('.')[0];
	getBlog(slug, (blog) => {
	  blogs.push(blog);
	});
      }catch(e){
        console.log(e);
      }
    });
    cb(blogs);
  });
}

module.exports = {
  getBlog: getBlog, 
  getBlogs: getBlogs
};
