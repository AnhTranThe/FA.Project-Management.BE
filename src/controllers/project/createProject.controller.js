const db = require("../../connection/database.connection");
const QueryDatabase = require("../../utils/queryDatabase");
const {GetProjectByName} = require("./getProject.controller");
const {v4: uuidv4, validate: validateUuid} = require("uuid");
const logger = require("../../loggers/loggers.config");

const CreateProject = async (req, res, next) => {
  const client = await db.connect();
  try {
    // Check name của project tạo mới ko được trùng với cái đã có trong hệ thống
    const checkName = await QueryDatabase(`SELECT * FROM project WHERE name='${req.body.name}'`);
    if (checkName.rowCount > 0) {
      return res.status(400).json({code: 400, message: "Project name already exists"});
    }
    // Begin transaction
    await client.query("BEGIN");

    // Create project
    const sqlCreateProject = `
      INSERT INTO project (name, payment, time_start, time_end, note, priority) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [req.body.name, req.body.payment, req.body.time_start, req.body.time_end, req.body.note, req.body.priority];

    const createdProject = await client.query(sqlCreateProject, values);
    const project_id = createdProject.rows[0].id;

    if (req.body.arrSelectedUser && req.body.arrSelectedUser.length > 0) {
      // arrSelectedUser chỉ danh sách User ngoại trừ user login và admin
      for (const user of req.body.arrSelectedUser) {
        const sqlCreateProjectUser = `
          INSERT INTO map_project_user (project_id, user_id, is_host) 
          VALUES ($1, $2, $3);
        `;
        const userValues = [project_id, user.user_id, user.is_host];
        await client.query(sqlCreateProjectUser, userValues);
      }
    }
    // Commit transaction
    await client.query("COMMIT");
    res.status(200).json({code: 200, message: "Create project success"});
  } catch (err) {
    // Rollback transaction in case of error
    await client.query("ROLLBACK");
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  } finally {
    client.release(); // Release client back to the
  }
};

const addUserInProject = async (req, res) => {
  try {
    const project_id = req.params.project_id;
    // check UUID project
    const isValidUuid = validateUuid(project_id);
    if (isValidUuid == false) {
      return res.status(400).json({code: 400, message: "Wrong format uuid"});
    }

    const listUser = req.body.arrSelectedUser;

    // check xem body có giá trị arrSelectedUser
    if (!listUser) {
      return res.status(400).json({code: 400, message: "Missing arrSelectedUser"});
    }

    // check arrSelectedUser có phải là array không
    if (typeof listUser === "string" || !listUser.length) {
      return res.status(400).json({code: 400, message: "arrSelectedUser should be array"});
    }

    // check xem arr có value không
    if (listUser.length === 0) {
      return res.status(400).json({code: 400, message: "arrSelectedUser should be have value, not empty"});
    }

    // check project_id có tồn tại trong bảng project
    const sqlCheckProject = `SELECT * FROM project WHERE id='${project_id}'`;
    const checkProjectID = await QueryDatabase(sqlCheckProject);
    if (checkProjectID.rows.length === 0) {
      return res.status(404).json({code: 404, message: "Project not exsisted on Database"});
    }

    // duyệt qua mảng kiểm tra id, is_host (boolean nên check không được FE check việc đó) có tồn tại và kiểm tra xem user_id có tồn tại trong project đó không
    for (const userDetail of listUser) {
      //check value có id có giá trị
      if (!userDetail.id) {
        return res.status(400).json({code: 400, message: "Value arrSelectedUser Should be have id and is_host"});
      }

      // check id và is_host có đúng kiểu
      if (typeof userDetail.id !== "string" || typeof userDetail.is_host !== "boolean") {
        return res.status(400).json({code: 400, message: "id: should be string (UUID), is_host: should be Boolean"});
      }

      const sqlCheckUserInproject = `SELECT * FROM map_project_user WHERE project_id='${project_id}' AND user_id='${userDetail.id}' LIMIT 1`;

      // check user đã có trong project hay chưa
      const checkUserInproject = await QueryDatabase(sqlCheckUserInproject);
      if (checkUserInproject.rows.length > 0) {
        return res
          .status(400)
          .json({code: 400, message: `user have ID : ${checkUserInproject.rows[0].user_id} already in project`});
      }
    }

    // nếu hoàn thành việc kiểm tra thì mới tạo data cho table map_project_id
    for (const userDetail of listUser) {
      const sqlCreateProjectUser = `
      INSERT INTO map_project_user (project_id, user_id, is_host) 
      VALUES ('${project_id}', '${userDetail.id}', '${userDetail.is_host}'); `;
      await QueryDatabase(sqlCreateProjectUser);
    }

    return res.status(200).json({code: 200, message: "Add User In Project Success"});
  } catch (err) {
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = {CreateProject, addUserInProject};
