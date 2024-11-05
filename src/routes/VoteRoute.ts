import { Router } from 'express';
import { PostsController } from '../controllers/PostsController';
import { CommentsController } from '../controllers/CommentsController';
import authJwt from '../middlewares/authJwt';

export class VoteRoute {

  private postsController: PostsController;
  private commentsController: CommentsController;

  constructor(postsController: PostsController, commentsController: CommentsController) {
    this.postsController = postsController;
    this.commentsController = commentsController;
  }
  createRouter(): Router {
    const router = Router();
  // Route: Upvote or downvote a post (Connected User Only)
  router.post('/posts/:id/vote', authJwt.verifyToken, this.postsController.voteOnPost.bind(this.postsController));

  // Route: Upvote or downvote a comment (Connected User Only)
  router.post('/comments/:id/vote', authJwt.verifyToken, this.commentsController.voteOnComment.bind(this.commentsController));

 return  router;

 }
}
