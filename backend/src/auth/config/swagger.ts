import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ft_transcendence API',
            version: '1.0.0',
            description: 'API documentation for the ft_transcendence project',
        },
        servers: [
            {
                url: `http://localhost:${config.port}/api`,
                description: 'Local server',
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
    apis: ['./src/auth/routes/*.ts', './src/auth/schemas/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
