const jwt = require("jsonwebtoken");

//function check token is have or not
const VerifyToken = (req, res, next) => {
  try {
    const checkBearer = req.headers["authorization"].includes("Bearer");
    if (!checkBearer) {
      return res.status(401).json({code: 401, message: "Do not have Bearer"});
    }

    const token = req.headers["authorization"].replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({code: 401, message: "Unauthorized"});
    }

    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).json({code: 401, message: "JWT expired"});
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({code: 401, message: "Unauthorized"});
  }
};

module.exports = VerifyToken;
// Cách dùng: Muốn verify token ở đâu thì bỏ VerifyToken vào phần route
