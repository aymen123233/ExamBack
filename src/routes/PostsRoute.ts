import { Router } from 'express';
import { PostsController } from '../controllers';
import authJwt from '../middlewares/authJwt';

export class PostsRoute {
  private postsController: PostsController;

  constructor(postsController: PostsController) {
    this.postsController = postsController;
  }

  createRouter(): Router {
    const router = Router();

    router.post('/posts', authJwt.verifyToken, this.postsController.createPost.bind(this.postsController));
    router.get('/posts', this.postsController.getPosts.bind(this.postsController));
    router.get('/posts/:id', this.postsController.getPostById.bind(this.postsController));
    router.put('/posts/:id', authJwt.verifyToken, this.postsController.updatePost.bind(this.postsController));
    router.delete('/posts/:id', authJwt.verifyToken, this.postsController.deletePost.bind(this.postsController));
    router.get('/users/:userId/posts', this.postsController.getAllPostsByUser.bind(this.postsController));
    router.get('/posts', this.postsController.getPostsByCategory.bind(this.postsController));


    // examen plus
    router.get('/search', this.postsController.search.bind(this.postsController));

    router.get('/trending', this.postsController.getTrendingPosts.bind(this.postsController));

    router.get('/posts', this.postsController.getFilteredPosts.bind(this.postsController));


    return router;
  }
}
