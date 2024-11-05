import * as controllers from './controllers';
import * as routes from './routes';
import * as services from './services';
import { FirestoreCollections } from './types/firestore';
import { RedisClientType } from 'redis';

export function initializeRoutes(db: FirestoreCollections, redisClient: RedisClientType) {
  // Initialize Users Service and Controller
  const usersService = new services.UsersService(db, redisClient);
  const userController = new controllers.UserController(usersService);
  const usersRoute = new routes.UsersRoute(userController);

  // Initialize Posts Service, Comments Service, and their Controllers
  const postsService = new services.PostsService(db);
  const commentsService = new services.CommentsService(db);
  const postsController = new controllers.PostsController(postsService);
  const commentsController = new controllers.CommentsController(commentsService);

  // Pass both controllers to PostsRoute
  const postsRoute = new routes.PostsRoute(postsController, commentsController);

  return {
    usersRoute,
    postsRoute,
  };
}
