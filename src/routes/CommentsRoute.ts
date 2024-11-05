import { Router } from 'express';
import { CommentsController } from '../controllers/CommentsController';
import { CommentsService } from '../services/CommentsService';
import authJwt from '../middlewares/authJwt';
import { checkRole } from '../middlewares/authJwt';
import { db } from '../utils/firestore-helpers';

const commentsService = new CommentsService(db);
const commentsController = new CommentsController(commentsService);

const router = Router();

// Route: Get all comments of a post (Accessible to everyone, including guests)
router.get('/posts/:postId/comments', commentsController.getCommentsByPost.bind(commentsController));

// Route: Get a comment by ID (Accessible to everyone, including guests)
router.get('/comments/:id', commentsController.getCommentById.bind(commentsController));

// Route: Add a comment to a post (Accessible to connected users only)
router.post('/posts/:postId/comments', authJwt.verifyToken, commentsController.addComment.bind(commentsController));

// Route: Update a comment (Accessible to admin or comment owner only)
router.put('/comments/:id', authJwt.verifyToken, checkRole('admin'), commentsController.updateComment.bind(commentsController));

// Route: Delete a comment (Accessible to admin or comment owner only)
router.delete('/comments/:id', authJwt.verifyToken, checkRole('admin'), commentsController.deleteComment.bind(commentsController));

export default router;
