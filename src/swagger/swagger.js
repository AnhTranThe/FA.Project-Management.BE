const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "Documentation for your API",
  },
  basePath: "/", // Base path for your API
};

const options = {
  swaggerDefinition,
  apis: ["../routes/*.js"], // Path to the API routes folder
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
