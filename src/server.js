require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
//import {rateLimit} from "express-rate-limit";
const swaggerUi = require("swagger-ui-express");
// const swaggerSpec = require("./swagger/swagger");
const swaggerFile = require("./swagger-output.json");
const allowedOrigins = process.env.ALLOW_ORIGINS;
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow all localhost origins
    if (origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    // Allow specific origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Disallow other origins
    return callback(new Error("Not allowed by CORS"));
  },
  optionsSuccessStatus: 200, // For legacy browser support
};
const app = express();
app.options("*", cors(corsOptions));
// Use CORS middleware
app.use(cors(corsOptions));
// const limitRequestConfig = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
//   message: "Too many requests from this IP 🔥🔥, please try again later !",
// });
//app.use(limitRequestConfig); // Apply the limit-requests middleware.
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Routes
const indexRouter = require("./routes/index.routes");
app.use("/", indexRouter);

//Swagger documentation
//app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); //Swagger documents
// app.get("/docs.json", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.send(swaggerSpec);
// });
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT, () => {
  console.log(`App 🖥️  is running ❤️  on port:: ${process.env.PORT}`);
});
