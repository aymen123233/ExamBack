import { Request, Response } from 'express';
import { PostsService } from '../services';
import { validationResult } from 'express-validator';

export class PostsController {
  private postsService: PostsService;

  constructor(postsService: PostsService) {
    this.postsService = postsService;
  }

  async createPost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { title, description, categories } = request.body;

        const postData = {
          title,
          description,
          categories,
          createdBy: request.userId,
        };

        const postResponse = await this.postsService.createPost(postData);

        response.status(postResponse.status).send({
          ...postResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        });
      }
    }
  }

  async getPosts(request: Request, response: Response): Promise<void> {
    try {
      console.log('Category name');
      console.log(request.query.category);

      const postsResponse = await this.postsService.getPosts();

      response.status(postsResponse.status).send({
        ...postsResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async getCategories(request: Request, response: Response): Promise<void> {
    try {
      const categoriesResponse = await this.postsService.getCategories();

      response.status(categoriesResponse.status).send({
        ...categoriesResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async addCommentToPost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { description } = request.body;

        const commentData = {
          description,
          createdBy: request.userId
        };

        const commentIResponse = await this.postsService.addCommentToPost(commentData, request.params.postId);

        response.status(commentIResponse.status).send({
          ...commentIResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        });
      }
    }
  }

  async getPostById(request: Request, response: Response): Promise<void> {
    try {
      const postResponse = await this.postsService.getPostById(request.params.id);
      response.status(postResponse.status).send({ ...postResponse });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async updatePost(request: Request, response: Response): Promise<void> {
    try {
      const postResponse = await this.postsService.updatePost(request.params.id, request.body);
      response.status(postResponse.status).send({ ...postResponse });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async deletePost(request: Request, response: Response): Promise<void> {
    try {
      const postResponse = await this.postsService.deletePost(request.params.id);
      response.status(postResponse.status).send({ ...postResponse });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getPostsByUser(request: Request, response: Response): Promise<void> {
    try {
      const postsResponse = await this.postsService.getPostsByUser(request.params.userId);
      response.status(postsResponse.status).send({ ...postsResponse });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async getPostsByCategory(request: Request, response: Response): Promise<void> {
    try {
      const category = request.query.category as string;
      const postsResponse = await this.postsService.getPostsByCategory(category);
      response.status(postsResponse.status).send({ ...postsResponse });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async voteOnPost(req: Request, res: Response): Promise<void> {
    const postId = req.params.id;
    const { vote } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(vote)) {
      res.status(400).json({ message: 'Invalid vote type' });
      return;
    }

    try {
      const result = await this.postsService.voteOnPost(postId, vote);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to vote on post', error });
    }
  }

  async getTrendingPosts(request: Request, response: Response): Promise<void> {
    try {
      const trendingPosts = await this.postsService.getTrendingPosts();
      response.status(200).json(trendingPosts);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

}
