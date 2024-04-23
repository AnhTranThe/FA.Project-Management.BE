const escape = require("escape-html");
const QueryDatabase = require("../../utils/queryDatabase");

const ChangeRoleUser = async (req, res, next) => {
  try {
    const email = escape(req.body.email);
    const role = escape(req.body.role);

    // Check Email có trong CSDL hay không
    const checkEmail = await QueryDatabase(`SELECT * FROM "user" WHERE email = '${email}'`);
    if (checkEmail.rowCount === 0) {
      return res.status(400).json({code: 400, message: "Email not found"});
    }

    const sql = ` UPDATE "user" SET role = '${role}' WHERE email = '${email}' `;
    await QueryDatabase(sql);
    res.status(200).json({code: 200, message: "Change role user success"});
  } catch (err) {
    console.error(err);
    res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = ChangeRoleUser;
