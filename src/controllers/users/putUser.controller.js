const escape = require("escape-html");
const QueryDatabase = require("../../utils/queryDatabase");
const logger = require("../../loggers/loggers.config");

const PutUser = async (req, res, next) => {
  try {
    const name = escape(req.body.name);
    const email = escape(req.body.email);

    // Check có truyền vào name hay ko: != null
    if (!name) {
      return res.status(400).json({code: 400, message: "Missing user name"});
    }

    // Check Email có trong CSDL hay không
    const checkEmail = await QueryDatabase(`SELECT * FROM "user" WHERE email = '${email}'`);
    if (checkEmail.rowCount === 0) {
      return res.status(400).json({code: 400, message: "Email not found"});
    }

    const sql = ` UPDATE "user" SET name = '${name}' WHERE email = '${email}' `;
    await QueryDatabase(sql);
    res.status(200).json({code: 200, message: "Change user success"});
  } catch (err) {
    logger.error(error);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = PutUser;
