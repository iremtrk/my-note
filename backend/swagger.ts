import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "My Note API",
    description: "otomatik api dokümantasyonu",
  },

  host: "localhost:5000",
  schemes: ["http"],

  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "JWT token giriniz. Bearer <token>",

    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/server.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);