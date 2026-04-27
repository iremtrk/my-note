import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Note API",
      version: "1.0.0",
      description: "apilerim",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],

    components: {
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "İrem",
            },
            email: {
              type: "string",
              example: "irem@test.com",
            },
            password: {
              type: "string",
              example: "123456",
            },
          },
        },

        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              example: "irem@test.com",
            },
            password: {
              type: "string",
              example: "123456",
            },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "jwt_token_here",
            },
            user: {
              type: "object",
              properties: {
                id: {
                  type: "integer",
                  example: 1,
                },
                name: {
                  type: "string",
                  example: "İrem",
                },
                email: {
                  type: "string",
                  example: "irem@test.com",
                },
              },
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.ts"],
});