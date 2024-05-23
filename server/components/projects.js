const fs = require('fs');
const path = require('path');

const projectsPath = path.resolve(__dirname, '../../resources/projects');

function getProject(slug, cb){
  try{
    const filePath = path.join(projectsPath, `${slug}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const project = JSON.parse(fileContents);
    project.date = new Date(project.date);

    cb(false, project);
  }catch(e){
    cb(e, {});
  }
}

function getProjects(cb){
  fs.readdir(projectsPath, (err, files) => {
    let projects = [];
    files.forEach((file) => {
      const slug = file.split('.')[0];
      getProject(slug, (e, project) => {
	if(e) return;
        projects.push(project);
      });
    });
    cb(projects);
  });
}

module.exports = {
  getProject: getProject, 
  getProjects: getProjects
};
