import { App } from '@/app';
import { UserRoute } from '@routes/users.route';
import { CategoryRoute } from '@routes/categories.route';
import { BookRoute } from '@routes/books.route';
import { HomeRoute } from '@routes/home.route';

// Mock des modules pour éviter les effets de bord
jest.mock('@/app');
jest.mock('@routes/users.route');
jest.mock('@routes/categories.route');
jest.mock('@routes/books.route');
jest.mock('@routes/home.route');

describe('Server', () => {
  beforeEach(() => {
    // On réinitialise l'état des mocks avant chaque test
    jest.clearAllMocks();
  });

  it("devrait instancier l'application et appeler listen()", () => {
    const mockAppInstance = {
      listen: jest.fn(),
    };

    // Simule l'instanciation de App
    (App as jest.Mock).mockImplementation(() => mockAppInstance);

    // Simule le chargement du serveur
    require('../server');

    // Vérifie que App a bien été instancié avec les routes
    expect(App).toHaveBeenCalledWith([expect.any(UserRoute), expect.any(CategoryRoute), expect.any(BookRoute), expect.any(HomeRoute)]);

    // Vérifie que listen() a bien été appelé
    expect(mockAppInstance.listen).toHaveBeenCalled();
  });
});
