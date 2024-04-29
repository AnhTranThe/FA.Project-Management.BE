const db = require("../../connection/database.connection");
const QueryDatabase = require("../../utils/queryDatabase");
const {v4: uuidv4, validate: validateUuid} = require("uuid");

const DeleteProject = async (req, res, next) => {
  const client = await db.connect();
  try {
    const id = req.body.id;

    // Check có truyền vào id hay ko
    if (!id) {
      return res.status(400).json({code: 400, message: "Missing id"});
    }
    // Kiểm tra xem project_id đúng định dạng uuid ko
    const isValidUuid = validateUuid(id);
    if (isValidUuid == false) {
      res.status(400).json({code: 400, message: "Wrong format uuid"});
      return;
    }
    // Begin transaction
    await client.query("BEGIN");

    // Check id có trong CSDL hay khong
    const checkId = await client.query("SELECT * FROM project WHERE id = $1", [id]);
    if (checkId.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({code: 400, message: "Project not found"});
    }

    // Delete project and associated entries in map_project_user
    await client.query("DELETE FROM project WHERE id = $1", [id]);
    await client.query("DELETE FROM map_project_user WHERE project_id = $1", [id]);

    // Commit transaction
    await client.query("COMMIT");

    res.status(200).json({code: 200, message: "Delete Project success"});
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  } finally {
    client.release(); // Release client back to the db
  }
};

const deleteUserInproject = async (req, res) => {
  try {
    // case 1 : dùng body là array
    // const project_id = req.params.project_id;
    // const listUser = req.body.arrSelectedUser;

    // // check UUID project
    // const isValidUuid = validateUuid(project_id);
    // if (isValidUuid == false) {
    //   return res.status(400).json({code: 400, message: "Wrong format uuid"});
    // }

    // // check project_id có tồn tại trong bảng project
    // const sqlCheckProject = `SELECT * FROM project WHERE id='${project_id}'`;
    // const checkProjectID = await QueryDatabase(sqlCheckProject);
    // if (checkProjectID.rows.length === 0) {
    //   return res.status(404).json({code: 404, message: "Project not exsisted on Database"});
    // }

    // // check arrSelectedUser có tồn tại
    // if (!listUser) {
    //   return res.status(400).json({code: 400, message: "Missing arrSelectedUser"});
    // }

    // // check arrSelectedUser có phải là array không
    // if (typeof listUser === "string" || (!listUser.length && listUser.length !== 0)) {
    //   return res.status(400).json({code: 400, message: "arrSelectedUser should be array"});
    // }

    // // check xem arr có value không
    // if (listUser.length === 0) {
    //   return res.status(400).json({code: 400, message: "arrSelectedUser should be have value, not empty"});
    // }

    // // check user có trong project đó không nếu có thì mới được xóa
    // for (const userDetail of listUser) {
    //   //check value có id có giá trị
    //   if (!userDetail.id) {
    //     return res.status(400).json({code: 400, message: "Value arrSelectedUser Should be have id"});
    //   }

    //   // check id có đúng kiểu
    //   if (typeof userDetail.id !== "string") {
    //     return res.status(400).json({code: 400, message: "id: should be string (UUID)"});
    //   }

    //   const sqlCheckUserInproject = `SELECT * FROM map_project_user WHERE project_id='${project_id}' AND user_id='${userDetail.id}' LIMIT 1`;

    //   // check user đã có trong project hay chưa
    //   const checkUserInproject = await QueryDatabase(sqlCheckUserInproject);
    //   if (checkUserInproject.rows.length === 0) {
    //     return res.status(400).json({code: 400, message: `user have ID : ${userDetail.id} not exsisted in project`});
    //   }
    // }

    // // nếu hoàn thành việc kiểm tra thì mới delete data cho table map_project_id
    // for (const userDetail of listUser) {
    //   const sqlDeleteProjectUser = `
    //   DELETE FROM map_project_user WHERE user_id='${userDetail.id}' AND project_id='${project_id}';
    //   `;
    //   await QueryDatabase(sqlDeleteProjectUser);
    // }

    // Case 2 : body là user_id: "string (UUID)"
    const project_id = req.params.project_id;
    const user_id = req.body.user_id;

    // check UUID project_id
    const isValidUuid = validateUuid(project_id);
    if (isValidUuid == false) {
      return res.status(400).json({code: 400, message: "Wrong format uuid project_id"});
    }

    // check user_id có tồn tại
    if (!user_id) {
      return res.status(400).json({code: 400, message: "Missing user_id"});
    }

    // check id có đúng kiểu
    if (typeof user_id !== "string") {
      return res.status(400).json({code: 400, message: "user_id: should be string (UUID)"});
    }

    //check UUID user_id có đúng
    const isValidUserIDUUID = validateUuid(user_id);
    if (isValidUserIDUUID == false) {
      return res.status(400).json({code: 400, message: "Wrong format uuid user_id"});
    }

    // check project_id có tồn tại trong table Project
    const sqlCheckProject = `SELECT * FROM project WHERE id='${project_id}'`;
    const checkProjectID = await QueryDatabase(sqlCheckProject);
    if (checkProjectID.rows.length === 0) {
      return res.status(404).json({code: 404, message: "Project not exsisted on Database"});
    }

    // check có thông tin trong table map_project_user trùng project_id và user_id nếu ko có thì không thể xóa
    const sqlCheckUserInproject = `SELECT * FROM map_project_user WHERE project_id='${project_id}' AND user_id='${user_id}' LIMIT 1`;
    const isvalidCheckUser = await QueryDatabase(sqlCheckUserInproject);
    if (isvalidCheckUser.rows.length === 0) {
      return res.status(404).json({code: 404, message: `user_id : ${user_id} not exsisted in this Project`});
    }

    // check hoàn thành thì sẽ xóa theo đúng dữ liệu cùng project_id và user_id
    const sqlDeleteProjectUser = `
      DELETE FROM map_project_user WHERE user_id='${user_id}' AND project_id='${project_id}';
      `;
    await QueryDatabase(sqlDeleteProjectUser);

    return res.status(200).json({code: 200, message: `Delete User Success`});
  } catch (error) {
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = {DeleteProject, deleteUserInproject};
