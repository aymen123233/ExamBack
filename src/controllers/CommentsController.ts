import { Request, Response } from 'express';
import { CommentsService } from '../services/CommentsService';
import { Comment } from '../types/entities/Comment';

export class CommentsController {
  private commentsService: CommentsService;

  constructor(commentsService: CommentsService) {
    this.commentsService = commentsService;
  }

  // Get all comments for a specific post
  async getCommentsByPost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    try {
      const response = await this.commentsService.getCommentsByPost(postId);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to retrieve comments', data: error });
    }
  }

  // Get a specific comment by its ID
  async getCommentById(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;

    try {
      const response = await this.commentsService.getCommentById(commentId);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to retrieve comment', data: error });
    }
  }

  // Add a new comment to a post
  async addComment(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { description, createdBy } = req.body;

    const commentData: Comment = {
      postId,
      description,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      voteCount: 0,
    };

    try {
      const response = await this.commentsService.addComment(commentData);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to add comment', data: error });
    }
  }

  // Update an existing comment by its ID
  async updateComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const commentData: Partial<Comment> = req.body;

    try {
      const response = await this.commentsService.updateComment(commentId, commentData);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to update comment', data: error });
    }
  }

  // Delete a comment by its ID
  async deleteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;

    try {
      const response = await this.commentsService.deleteComment(commentId);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to delete comment', data: error });
    }
  }

  async voteOnComment(req: Request, res: Response): Promise<void> {
    const commentId = req.params.id;
    const { voteType } = req.body;
    const userId = req.userId; // Assuming userId is populated by authentication middleware

    // Ensure userId is defined
    if (!userId) {
      res.status(400).json({ status: 400, message: 'User ID is required' });
      return;
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      res.status(400).json({ message: 'Invalid vote type' });
      return;
    }

    try {
      const result = await this.commentsService.voteOnComment(commentId, voteType, userId);
      res.status(result.status).json(result);
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Failed to vote on comment', data: error });
    }
  }
}
