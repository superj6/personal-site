const fs = require('fs');
const path = require('path');

const resumePath = path.resolve(__dirname, '../../resources/resume');

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
