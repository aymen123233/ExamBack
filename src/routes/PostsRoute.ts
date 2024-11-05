import { Router } from 'express';
import { PostsController } from '../controllers';
import { validateCreatePost } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';
import { CommentsController } from '../controllers/CommentsController';

export class PostsRoute {
  private postsController: PostsController;
  private commentsController: CommentsController;

  constructor(postsController: PostsController, commentsController: CommentsController) {
    this.postsController = postsController;
    this.commentsController = commentsController;
  }

  createRouter(): Router {
    const router = Router();

    // Post routes
    router.post('/posts', authJwt.verifyToken, validateCreatePost, this.postsController.createPost.bind(this.postsController));
    router.get('/posts', this.postsController.getPosts.bind(this.postsController));
    router.get('/posts/:id', this.postsController.getPostById.bind(this.postsController));
    router.put('/posts/:id', authJwt.verifyToken, this.postsController.updatePost.bind(this.postsController));
    router.delete('/posts/:id', authJwt.verifyToken, this.postsController.deletePost.bind(this.postsController));

    // Posts by user and category
    router.get('/users/:userId/posts', this.postsController.getPostsByUser.bind(this.postsController));
    router.get('/posts', this.postsController.getPostsByCategory.bind(this.postsController));

    // Commenting and categories
    router.post('/posts/:postId/comments', authJwt.verifyToken, this.postsController.addCommentToPost.bind(this.postsController));
    router.get('/categories', this.postsController.getCategories.bind(this.postsController));



    return router;
  }
}
