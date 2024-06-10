const escape = require("escape-html");
const QueryDatabase = require("../../utils/queryDatabase");
const logger = require("../../loggers/loggers.config");

const DeleteUser = async (req, res, next) => {
  try {
    const id = escape(req.body.id);

    // Check có truyền vào id hay không
    if (!id) {
      return res.status(400).json({code: 400, message: "Missing id"});
    }

    // Check id có trong CSDL hay không
    const checkId = await QueryDatabase(`SELECT * FROM "user" WHERE id='${id}'`);
    if (checkId.rowCount === 0) {
      return res.status(400).json({code: 400, message: "User not found"});
    }

    const sql = `
      DELETE FROM "user" WHERE id='${id}';
    `;
    await QueryDatabase(sql);
    res.status(200).json({code: 200, message: "Delete user success"});
  } catch (err) {
    logger.error(error);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = DeleteUser;
