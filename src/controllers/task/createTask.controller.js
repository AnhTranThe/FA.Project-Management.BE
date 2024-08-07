const QueryDatabase = require("../../utils/queryDatabase");
const {v4: uuidv4, validate: validateUuid} = require("uuid");
const logger = require("../../loggers/loggers.config");

const CreateTask = async (req, res, next) => {
  try {
    // Kiểm tra xem project_id đúng định dạng uuid ko
    const isValidUuid = validateUuid(req.body.project_id);
    if (isValidUuid == false) {
      res.status(400).json({code: 400, message: "Wrong format uuid"});
      return;
    }

    // Check email + project_id phải trùng với cái đã có trong CSDL
    const checkEmail = await QueryDatabase(`SELECT * FROM "user" WHERE email='${req.body.user_mail}'`);
    const checkProjectId = await QueryDatabase(`SELECT * FROM project WHERE id=${"'" + req.body.project_id + "'"}`);

    if (checkEmail.rowCount > 0 && checkProjectId.rowCount > 0 && isValidUuid == true) {
      const sql = `
        INSERT INTO Task ("user_mail", "project_id", "time_start", "time_end", "status", "note") 
        VALUES (
          '${req.body.user_mail}',
          '${req.body.project_id}',
          '${req.body.time_start}',
          '${req.body.time_end}',
          '${req.body.status}',
          '${req.body.note}'
        );
      `;
      await QueryDatabase(sql);
      res.status(200).json({code: 200, message: "Create task success"});
    } else {
      res.status(400).json({code: 400, message: "User or Project not match with database, please check again"});
      return;
    }
  } catch (err) {
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = CreateTask;
