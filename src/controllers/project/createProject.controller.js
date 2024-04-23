const QueryDatabase = require("../../utils/queryDatabase");
const {GetProjectByName} = require("./getProject.controller");

const CreateProject = async (req, res, next) => {
  try {
    // Check name của project tạo mới ko được trùng với cái đã có trong hệ thống
    const checkName = await QueryDatabase(`SELECT * FROM project WHERE name='${req.body.name}'`);
    if (checkName.rowCount > 0) {
      return res.status(400).json({code: 400, message: "Project name already exists"});
    }

    const sqlCreateProject = `
      INSERT INTO project (name, payment, time_start , time_end, note, priority) 
      VALUES ('${req.body.name}', '${req.body.payment}', '${req.body.time_start}','${req.body.time_end}' ,'${req.body.note}','${req.body.priority}');
    `;
    const createdProject = await QueryDatabase(sqlCreateProject);
    if (!createdProject) {
      return res.status(400).json({code: 400, message: "Request create project error"});
    }

    // If selected users exist, associate them with the project
    if (req.body.arrSelectedUser && req.body.arrSelectedUser.length > 0) {
      const projectId = await QueryDatabase(`SELECT id FROM project WHERE name='${req.body.name}'`);
      const project_id = projectId.rows[0].id;
      for (const userId of req.body.arrSelectedUser) {
        const sqlCreateProjectUser = `
      INSERT INTO map_project_user (project_id, user_id) 
      VALUES ('${project_id}', '${userId}');
    `;
        await QueryDatabase(sqlCreateProjectUser);
      }
    }
    res.status(200).json({code: 200, message: "Create project success"});
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = CreateProject;
