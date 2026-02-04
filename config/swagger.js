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
        url: `${config.baseUrl}/api/v1`, // ✅ Added /api/v1 so "Try it out" works correctly
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
  // ✅ Path updated to find your versioned routes and controllers
  apis: ['./routes/v1/*.js', './controllers/v1/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📖 Swagger Docs available at ${config.baseUrl}/api-docs`);
};

export default setupSwagger;