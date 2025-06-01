import { App } from '@/app';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { CategoryRoute } from './routes/categories.route';
import { BookRoute } from './routes/books.route';
import { HomeRoute } from './routes/home.route';
import { AuthRoute } from './routes/auth.route';

ValidateEnv();

const app = new App([new UserRoute(), new CategoryRoute(), new BookRoute(), new HomeRoute(), new AuthRoute()]);

app.listen();
