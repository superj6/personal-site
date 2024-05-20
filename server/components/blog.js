const fs = require('fs');
const path = require('path');
const parseMd = require('parse-md').default;

const blogPath = path.resolve(__dirname, '../../client/blog-posts');

function getBlog(slug, cb){
  const filePath = path.join(blogPath, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const parsed = parseMd(fileContents);

  const blog = {
    slug: slug, 
    meta: parsed.metadata,
    content: parsed.content
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
