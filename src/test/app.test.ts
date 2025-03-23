import request from 'supertest';
import { App } from '../app';
import { Routes } from '@interfaces/routes.interface';

// Mock des valeurs d'environnement
jest.mock('@config', () => ({
  NODE_ENV: 'test',
  PORT: '4000',
  LOG_FORMAT: 'dev',
  ORIGIN: '*',
  CREDENTIALS: true,
}));

// Mock du logger pour éviter les logs en test
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
  stream: { write: jest.fn() },
}));

describe('App', () => {
  let app: App;

  beforeAll(() => {
    const mockRoutes: Routes[] = [
      {
        path: '/test',
        router: require('express')
          .Router()
          .get('/test', (req, res) => res.status(200).json({ message: 'OK' })),
      },
    ];
    app = new App(mockRoutes);
  });

  it('devrait initialiser Express avec succès', () => {
    expect(app).toBeDefined();
  });

  it('devrait répondre avec un code 200 sur /test', async () => {
    const response = await request(app.getServer()).get('/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OK' });
  });

  it('devrait lancer le serveur sans erreur', () => {
    const listenSpy = jest.spyOn(app.getServer(), 'listen').mockImplementation((...args: any[]) => {
      const callback = args[args.length - 1]; // Récupère le dernier argument (le callback)
      if (typeof callback === 'function') callback();
      return app.getServer();
    });

    app.listen();
    expect(listenSpy).toHaveBeenCalled();
  });
});
