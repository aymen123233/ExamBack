import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CommentsService } from '../services/CommentsService';

export class CommentController {
  private commentsService: CommentsService;

  constructor(commentsService: CommentsService) {
    this.commentsService = commentsService;
  }

  async addComment(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { postId } = request.params;
        const { userId, content } = request.body;
        const commentData = { postId, userId, content };

        const commentResponse = await this.commentsService.addComment(commentData);

        response.status(commentResponse.status).json({
          ...commentResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error,
        });
      }
    }
  }



async getCommentsByPostId(request: Request, response: Response): Promise<void> {
  const { postId } = request.params;
  const commentsResponse = await this.commentsService.getCommentsByPostId(postId);

  response.status(commentsResponse.status).json(commentsResponse);
}


async getAllComments(request: Request, response: Response): Promise<void> {
  try {
    const commentsResponse = await this.commentsService.getAllComments();
    response.status(commentsResponse.status).json(commentsResponse);
  } catch (error) {
    response.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: error,
    });
  }
}


  async updateComment(request: Request, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const { content } = request.body;

      const updatedComment = await this.commentsService.updateComment(id, content);

      response.status(updatedComment.status).json({
        ...updatedComment,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async deleteComment(request: Request, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const deleteResponse = await this.commentsService.deleteComment(id);

      response.status(deleteResponse.status).json({
        ...deleteResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getTopComments(request: Request, response: Response): Promise<void> {
    const topComments = await this.commentsService.getTopComments();
    response.status(topComments.status).json(topComments);
  }

}
