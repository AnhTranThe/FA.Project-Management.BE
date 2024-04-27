const jwt = require("jsonwebtoken");
const {GenerateAccessToken, GenerateRefreshToken} = require("../../utils/generateJWT");
const QueryDatabase = require("../../utils/queryDatabase");
const {compareHashPassword} = require("../../utils/hashBcrypt");

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

      const accessToken = GenerateAccessToken({user_name: findAccount?.name, role: role.rows[0].role});
      const refreshToken = GenerateRefreshToken({user_name: findAccount?.name, role: role.rows[0].role});
      res.status(200).json({
        id: findAccount.id,
        role: role.rows[0].role,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  } catch (error) {
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
    res.status(401).json({code: 401, message: "JWT expired"});
  }
};

module.exports = {
  Login,
  RefreshToken,
};
