const QueryDatabase = require("../../utils/queryDatabase");

const CreateProject = async (req, res, next) => {
  const client = await pool.connect();
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
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  } finally {
    client.release(); // Release client back to the pool
  }
};

module.exports = CreateProject;
