import { Router } from 'express';
import { VoteController } from '../controllers/VoteController';
import authJwt from '../middlewares/authJwt';
import { CommentController } from '../controllers';

export class CommentsVoteRoutes {
  private commentController: CommentController;
  private voteController: VoteController;

  constructor(commentController: CommentController, voteController: VoteController) {
    this.commentController = commentController;
    this.voteController = voteController;
  }

  createRouter(): Router {
    const router = Router();


    router.get('/posts/:postId/comments', this.commentController.getCommentsByPostId.bind(this.commentController));
    router.get('/comments/:id', this.commentController.getCommentsByPostId.bind(this.commentController));
    router.post('/posts/:postId/comments', authJwt.verifyToken, this.commentController.addComment.bind(this.commentController));
    router.put('/comments/:id', authJwt.verifyToken, this.commentController.updateComment.bind(this.commentController));
    router.delete('/comments/:id', authJwt.verifyToken, this.commentController.deleteComment.bind(this.commentController));
    router.get('/comments', authJwt.verifyToken, this.commentController.getAllComments.bind(this.commentController));


    // Routes pour les votes
    router.post('/posts/:id/vote', authJwt.verifyToken, this.voteController.vote.bind(this.voteController));
    router.post('/comments/:id/vote', authJwt.verifyToken, this.voteController.vote.bind(this.voteController));


    // router.get('/comments/top', this.commentController.getTopComments.bind(this.commentController));


    return router;
  }
}
