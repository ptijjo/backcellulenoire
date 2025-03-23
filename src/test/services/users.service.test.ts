import { CreateUserDto } from '@/dtos/users.dto';
import { User } from '@/interfaces/users.interface';
import { UserService } from '@/services/users.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    })),
  };
});
describe('UserService', () => {
  let userService: UserService;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    userService = new UserService();
    prismaMock = new PrismaClient() as jest.Mocked<PrismaClient>;
    userService.user = prismaMock.user;
  });

  it('devrait retourner tous les utilisateurs avec la recherche et pagination', async () => {
    const users: User[] = [
      {
        id: '1',
        email: 'test@test.com',
        password: '',
        pseudo: 'test',
        avatar: 'tintin',
        createdAt: new Date(),
        idInvitation: '165888',
      },
      {
        id: '2',
        email: 'test2@test.com',
        password: 'kiokl',
        pseudo: 'test2',
        avatar: 'tintin2',
        createdAt: new Date(),
        idInvitation: '1658882',
      },
    ];

    // Simule une recherche et une pagination
    const search = 'test';
    const page = 1;
    const itemPerPage = 10;

    (prismaMock.user.findMany as jest.Mock).mockResolvedValue(users);

    const resultat = await userService.findAllUser(search, page, itemPerPage);

    expect(resultat).toEqual(users);
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      skip: 0, // Calculé par la pagination
      take: itemPerPage,
      where: {
        OR: [{ pseudo: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
      },
    });
  });

  it('devrait retourner un utilisateur en fonction de id', async () => {
    const users: User = {
      id: '1',
      email: 'test@test.com',
      password: '',
      pseudo: 'test',
      avatar: 'tintin',
      createdAt: new Date(),
      idInvitation: '165888',
    };

    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(users);

    const resultat = await userService.findUserById('1');
    expect(resultat).toEqual(users);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it("devrait pas trouver d'user en fonction de l'id", async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(userService.findUserById('2')).rejects.toThrowError("User doesn't exist");

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: '2' },
    });
  });

  it('devrait créer un nouvel utilisateur', async () => {
    const userData: CreateUserDto = {
      email: 'test@test.com',
      password: 'password123',
      pseudo: 'test',
      role: 'user',
      idInvitation: '125788uiop',
      createdAt: new Date(),
    };

    // Mock de bcrypt pour éviter le hashage réel
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    (prismaMock.user.create as jest.Mock).mockResolvedValue({
      id: '123',
      ...userData,
      password: 'hashed_password', // Simule le hash
    });

    const user = await userService.createUser(userData);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(user.email).toBe(userData.email);
    expect(user.pseudo).toBe(userData.pseudo);
    expect(user.role).toBe(userData.role);
    expect(user.idInvitation).toBe(userData.idInvitation);
    expect(user.createdAt).toBe(userData.createdAt);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, expect.any(Number)); // Vérifie que bcrypt a été appelé
    expect(user.password).toBe('hashed_password');
  });

  it('devrait modifier un utilisateur', async () => {});
});
