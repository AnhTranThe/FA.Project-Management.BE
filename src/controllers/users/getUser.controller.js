const escape = require("escape-html");
const QueryDatabase = require("../../utils/queryDatabase");
const {containsWord} = require("../../utils/checkCharacter");
const logger = require("../../loggers/loggers.config");

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
    logger.error(err);
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
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetUsersJoinInProject = async (req, res, next) => {
  try {
    const projectId = escape(req.params.projectId);
    const sql = `
    select u.id, u.email, mpu.is_host  FROM Project p  
    INNER JOIN map_project_user mpu  ON p.id  = mpu.project_id 
    INNER JOIN "user" u  on mpu.user_id  = u.id 
    WHERE p.id  = '${projectId}'`;

    const data = await QueryDatabase(sql);
    res.status(200).send(data.rows);
  } catch (err) {
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

const GetProjectBySearch = async (req, res) => {
  try {
    const key = escape(req.query.search);
    const sqlGetProjectByName = `
      SELECT * FROM project
    `;

    const data = await QueryDatabase(sqlGetProjectByName);
    // check xem key word phải có ít nhất 1 từ giống trong chuổi string name
    const dataSearchBykey = data.rows.filter((ele) => {
      const checkKey = containsWord(ele.name, key);
      if (checkKey) {
        return ele;
      }
    });
    return res.status(200).send({code: 200, data: dataSearchBykey});
  } catch (err) {
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};
module.exports = {
  GetUser,
  GetUserById,
  GetUsersJoinInProject,
  GetProjectBySearch,
};
