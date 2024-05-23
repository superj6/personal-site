const fs = require('fs');
const path = require('path');

const mdHelper = require('./md');

const blogPath = path.resolve(__dirname, '../../resources/blog-posts');

function getBlog(slug, cb){
  try{
    const filePath = path.join(blogPath, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const parsed = mdHelper.parseMd(fileContents);
   
    const blog = {
      slug: slug, 
      meta: parsed.metadata,
      content: parsed.content
    };

    cb(false, blog);
  }catch(e){
    cb(e, {});
  }
}

function getBlogs(cb){
  fs.readdir(blogPath, (err, files) => {
    let blogs = [];
    files.forEach((file) => {
      const slug = file.split('.')[0];
      getBlog(slug, (e, blog) => {
	if(e) return;
        blogs.push(blog);
      });
    });
    cb(blogs);
  });
}

module.exports = {
  getBlog: getBlog, 
  getBlogs: getBlogs,
};
