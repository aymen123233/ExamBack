import * as controllers from './controllers';
import * as routes from './routes';
import * as services from './services';
import { FirestoreCollections } from './types/firestore';
import { RedisClientType } from 'redis';

export function initializeRoutes(db: FirestoreCollections, redisClient: RedisClientType) {
  const usersService = new services.UsersService(db, redisClient);
  const userController = new controllers.UserController(usersService);
  const usersRoute = new routes.UsersRoute(userController);

  const postsService = new services.PostsService(db);
  const postsController = new controllers.PostsController(postsService);
  const postsRoute = new routes.PostsRoute(postsController);

  const commentService = new services.CommentsService(db);
  const commentController = new controllers.CommentController(commentService);

  const voteService = new services.VotesService(db);
  const voteController = new controllers.VoteController(voteService);

  const commentVoteRoute = new routes.CommentsVoteRoutes(commentController, voteController);

  return {
      usersRoute,
      postsRoute,
      commentVoteRoute
  };
}

