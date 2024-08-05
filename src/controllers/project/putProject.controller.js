const QueryDatabase = require("../../utils/queryDatabase");
const {v4: uuidv4, validate: validateUuid} = require("uuid");
const logger = require("../../loggers/loggers.config");

const PutProject = async (req, res, next) => {
  try {
    const name = req.body.name;
    const payment = req.body.payment;
    const time_start = req.body.time_start;
    const time_end = req.body.time_end;
    const note = req.body.note;
    const priority = req.body.priority;
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

    const sql = `
      UPDATE project 
      SET name =  ${"'" + name + "'"}, 
      payment =  ${"'" + payment + "'"}, 
      time_start = ${"'" + time_start + "'"}, 
      time_end = ${"'" + time_end + "'"}, 
      note = ${"'" + note + "'"}, 
      priority = ${"'" + priority + "'"} 
      WHERE id =  ${"'" + id + "'"}
    `;
    await QueryDatabase(sql);
    res.status(200).json({code: 200, message: "Change project success"});
  } catch (err) {
    logger.error(err);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = PutProject;
