const escape = require("escape-html");
const QueryDatabase = require("../../utils/queryDatabase");

const GetUser = async (req, res, next) => {
  try {
    const sql = `
      SELECT * FROM "user";
    `;

    const data = await QueryDatabase(sql);
    res.status(200).send(
      data.rows.map((row) => {
        delete row.password;
        return row;
      }),
    );
  } catch (err) {
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetUserById = async (req, res, next) => {
  try {
    const id = escape(req.params.id);
    const sql = `
      SELECT * FROM "user" WHERE id = '${id}'
    `;

    const data = await QueryDatabase(sql);
    res.status(200).send(
      data.rows.map((row) => {
        delete row.password;
        return row;
      }),
    );
  } catch (err) {
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetUsersJoinInProjectId = async (req, res, next) => {
  try {
    const projectId = escape(req.params.projectId);
    const sql = `
    select  u.email  FROM Project p  
    INNER JOIN map_project_user mpu  ON p.id  = mpu.project_id 
    INNER JOIN "user" u  on mpu.user_id  = u.id 
    WHERE p.id  = '${projectId}'`;

    const data = await QueryDatabase(sql);
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};
module.exports = {
  GetUser,
  GetUserById,
  GetUsersJoinInProjectId,
};
