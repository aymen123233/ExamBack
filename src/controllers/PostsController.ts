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

        response.status(postResponse.status).send(postResponse);
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
      const postsResponse = await this.postsService.getPosts();
      response.status(postsResponse.status).send(postsResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async getPostById(request: Request, response: Response): Promise<void> {
    try {
      const postId = request.params.id;
      const postResponse = await this.postsService.getPostById(postId);

      response.status(postResponse.status).send(postResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async updatePost(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
      return;
    }

    const userId = request.userId;

    if (!userId) {
      response.status(400).json({
        status: 400,
        message: 'User ID is required.',
      });
      return;
    }

    try {
      const postId = request.params.id;
      const postData = request.body;

      const postResponse = await this.postsService.updatePost(postId, userId, postData);

      response.status(postResponse.status).send(postResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }


  async deletePost(request: Request, response: Response): Promise<void> {
    const userId = request.userId;

    // Vérification de la présence de userId
    if (!userId) {
      response.status(400).json({
        status: 400,
        message: 'User ID is required.',
      });
      return;
    }

    try {
      const postId = request.params.id;

      // Appel du service pour supprimer le post
      const postResponse = await this.postsService.deletePost(postId, userId);

      response.status(postResponse.status).send(postResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }


  async getAllPostsByUser(request: Request, response: Response): Promise<void> {
    try {
      const userId = request.params.userId;
      const postsResponse = await this.postsService.getAllPostsByUser(userId);

      response.status(postsResponse.status).send(postsResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async getPostsByCategory(request: Request, response: Response): Promise<void> {
    try {
      const category = request.query.category as string;
      const postsResponse = await this.postsService.getPostsByCategory(category);

      response.status(postsResponse.status).send(postsResponse);
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      });
    }
  }

  async search(request: Request, response: Response): Promise<void> {
    const { query, type } = request.query;
    const searchResults = await this.postsService.search(query as string, type as string);
    response.status(searchResults.status).json(searchResults);
  }

  async getTrendingPosts(request: Request, response: Response): Promise<void> {
    const trendingPosts = await this.postsService.getTrendingPosts();
    response.status(trendingPosts.status).json(trendingPosts);
  }

  async getFilteredPosts(request: Request, response: Response): Promise<void> {
    const { category, sortBy } = request.query;
    const filteredPosts = await this.postsService.getFilteredPosts(category as string, sortBy as string);
    response.status(filteredPosts.status).json(filteredPosts);
  }

}
