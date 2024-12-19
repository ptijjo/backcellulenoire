import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import http from 'http';
import path from 'path';

export class App {
  public app: express.Application;
  public env: string;
  public port: number;
  public server: http.Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = Number(PORT);
    this.server = http.createServer(this.app);

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.server
      .listen(this.port, '127.0.0.1', () => {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${this.env} =======`);
        logger.info(`🚀 App listening on http://127.0.0.1:${this.port}`);
        logger.info(`=================================`);
      })
      .on('error', err => {
        logger.error(`❌ Failed to start the server: ${err.message}`);
        process.exit(1);
      });
    process.on('SIGINT', () => {
      logger.info('🔄 Gracefully shutting down...');
      this.server.close(() => {
        logger.info('✅ Server closed successfully.');
        process.exit(0);
      });
    });
  }

  public getServer() {
    return this.server;
  }
  private initializeMiddlewares() {
    this.app.use('/public', express.static(path.join(__dirname, '../public')));
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
