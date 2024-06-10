const jwt = require("jsonwebtoken");
const {GenerateAccessToken, GenerateRefreshToken} = require("../../utils/generateJWT");
const QueryDatabase = require("../../utils/queryDatabase");
const {compareHashPassword, hashPassword} = require("../../utils/hashBcrypt");
const {upperCaseName} = require("../../utils/checkCharacter");
const logger = require("../../loggers/loggers.config");

const Login = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM "user";
    `;
    const data = await QueryDatabase(sql);
    const {email, password} = req.body;
    const findAccount = data.rows.find((item) => item.email === email);

    // Check email
    if (!findAccount) {
      res.status(401).json({code: 401, message: "Email not found"});
    }

    // Compare Password with database
    const checkPassword = await compareHashPassword(password, findAccount.password);
    if (checkPassword === false) {
      res.status(401).json({code: 401, message: "Password is wrong"});
    }
    if (checkPassword === true) {
      const sql_search_role = `SELECT role FROM "user" WHERE email = '${email}'`;
      const role = await QueryDatabase(sql_search_role);

      const accessToken = GenerateAccessToken({
        id: findAccount.id,
        email: findAccount.email,
        user_name: findAccount?.name,
        role: role.rows[0].role,
      });
      const refreshToken = GenerateRefreshToken({
        id: findAccount.id,
        email: findAccount.email,
        user_name: findAccount?.name,
        role: role.rows[0].role,
      });
      res.status(200).json({
        // id: findAccount.id,
        // role: role.rows[0].role,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  } catch (error) {
    logger.error(error);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(401).json({code: 401, message: "Unauthorized"});
  }
};

const RefreshToken = async (req, res) => {
  try {
    const authHeaders = req.headers["authorization"];

    if (!authHeaders) {
      return res.status(401).json({code: 401, message: "Can not find authorization header"});
    }

    const checkBearer = authHeaders.includes("Bearer");
    if (!checkBearer) {
      return res.status(401).json({code: 401, message: "Do not have Bearer"});
    }

    const token = authHeaders.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({code: 401, message: "Unauthorized"});
    }

    const decodedJWT = jwt.decode(token);
    const refresh_token = GenerateRefreshToken({user_name: decodedJWT.user_name, role: decodedJWT.role});
    res.status(200).json({refresh_token: refresh_token});
  } catch (error) {
    logger.error(error);
    console.error("Internal Server Error 🔥:: ", err);
    res.status(401).json({code: 401, message: "JWT expired"});
  }
};

const Register = async (req, res) => {
  try {
    const formUser = req.body;
    // check formUser email, name, password có phải type String, role có phải number
    if (typeof formUser.name !== "string" || typeof formUser.email !== "string" || typeof formUser.password !== "string") {
      return res.status(400).json({code: 400, message: "email, name, password should be string"});
    }

    if (typeof formUser.role !== "number") {
      return res.status(400).json({code: 400, message: "role should be number"});
    }

    if (formUser.role < 0 || formUser.role > 2) {
      return res.status(400).json({code: 400, message: "role should be 1 or 2"});
    }

    const slqSelectUser = `
      SELECT * FROM "user"
    `;
    const dataUser = await QueryDatabase(slqSelectUser);

    // check email có bị trùng
    const checkEmail = dataUser.rows.filter((ele) => {
      return ele.email.trim() === formUser.email.trim();
    });
    if (checkEmail.length > 0) {
      return res.status(400).json({code: 400, message: `email : ${formUser.email} already exsisted`});
    }

    // check có chùng name trong table user
    const checkName = dataUser.rows.filter((ele) => {
      return ele.name.trim().toLowerCase() === formUser.name.trim().toLowerCase();
    });

    if (checkName.length > 0) {
      return res.status(400).json({code: 400, message: `name : ${formUser.name} already exsisted`});
    }

    const newData = {
      ...formUser,
      name: upperCaseName(formUser.name.trim()),
      password: await hashPassword(formUser.password),
    };

    const sqlCreateUser = `
      INSERT INTO "user" (name, email, password , role) 
      VALUES ('${newData.name}', '${newData.email}', '${newData.password}','${newData.role}');
    `;

    await QueryDatabase(sqlCreateUser);
    return res.status(200).json({code: 200, message: "Create User Success"});
  } catch (error) {
    logger.error(error);
    console.error("Internal Server Error 🔥:: ", err);
    return res.status(500).json({code: 500, message: "Internal Server Error"});
  }
};

module.exports = {
  Login,
  Register,
  RefreshToken,
};
