const QueryDatabase = require("../../utils/queryDatabase");
const {v4: uuidv4, validate: validateUuid} = require("uuid");

const GetProject = async (req, res, next) => {
  try {
    const sql = `
      SELECT * FROM project;
    `;
    const data = await QueryDatabase(sql);
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetProjectById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Kiểm tra xem project_id đúng định dạng uuid ko
    const isValidUuid = validateUuid(id);
    if (isValidUuid == false) {
      res.status(400).json({code: 400, message: "Wrong format uuid"});
      return;
    }

    const sql = `
    SELECT * FROM project WHERE id=${"'" + id + "'"}
    `;

    const data = await QueryDatabase(sql);
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetProjectByUser = async (req, res, next) => {
  try {
    const email = req.params.email;

    // Kiểm tra xem có truyền vào hay ko
    if (!email) {
      res.status(400).json({code: 400, message: "Not have email, please check email again"});
      return;
    }
    // const sql = `
    //   SELECT DISTINCT c.*
    //   FROM task a INNER JOIN "user" b ON a.user_mail = b.email INNER JOIN project c ON a.project_id = c.id
    //   WHERE b.email = ${"'" + email + "'"}
    // `;
    const sql = `
    select distinct  p.*
    FROM "project" p
    INNER JOIN map_project_user mpu ON p.id = mpu.project_id
    INNER JOIN "user" u ON u.id = mpu.user_id
    WHERE u.email =${"'" + email + "'"} `;

    const data = await QueryDatabase(sql);
    res.status(200).send(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = {
  GetProject,
  GetProjectById,
  GetProjectByUser,
};
