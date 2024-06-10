// const swaggerJSDoc = require("swagger-jsdoc");
// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "FA Project Management API",
//       version: "1.0.0",
//       description: "API documentation for the FA Project Management application",
//     },
//   },
//   apis: ["src/routes/*.js"],
// };
const swaggerAutogen = require("swagger-autogen")();
const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: `localhost:${process.env.PORT}`,
};

const outputFile = "./swagger-output.json";
const routes = ["src/routes/index.routes.js"];

swaggerAutogen(outputFile, routes, doc);

// const swaggerSpec = swaggerJSDoc(options);

// module.exports = swaggerSpec;
