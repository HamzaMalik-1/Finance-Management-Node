import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Management System API',
      version: '1.0.0',
      description: 'API Documentation for the UET Finance Project',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: config.baseUrl, // Adjust to your PORT
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Path to the API docs (where your routes are defined)
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📖 Swagger Docs available at ${config.baseUrl}/api-docs`);
};

export default setupSwagger;