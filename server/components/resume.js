const fs = require('fs');
const path = require('path');

const mdHelper = require('./md');

const resumePath = path.resolve(__dirname, '../../client/resume');

function getResume(cb){
  try{
    const filePath = path.join(resumePath, 'resume.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    cb(false, fileContents);
  }catch(e){
    cb(e, {});
  }
}

module.exports = {
  getResume: getResume
};
