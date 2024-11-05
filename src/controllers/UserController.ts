import { Request, Response } from 'express';
import { UsersService } from '../services';
import { validationResult } from 'express-validator';

export class UserController {
  private usersService: UsersService;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  async createUser(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { email, password, username } = request.body;

        const userData = { email, password, username };

        const userResponse = await this.usersService.createUser(userData);

        response.status(userResponse.status).send({
          ...userResponse,
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        })
      }
    }
  }

  async getUsers(request: Request, response: Response): Promise<void> {
    try {
      const usersResponse = await this.usersService.getUsers();

      response.status(usersResponse.status).send({
        ...usersResponse,
      });
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      })
    }
  }

  async getUserById(request: Request, response: Response): Promise<void> {
    try {
      if (request.params.id) {
        const usersResponse = await this.usersService.getUserById(request.params.id);

        response.status(usersResponse.status).send({
          ...usersResponse,
        });
      } else {
        response.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error
      })
    }
  }

  async login(request: Request, response: Response): Promise<void> {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      response.status(400).json({
        status: 400,
        message: 'Bad request.',
        data: errors.array(),
      });
    } else {
      try {
        const { email, password } = request.body;
        const userData = { email, password };

        const userResponse = await this.usersService.login(userData);

        response.status(userResponse.status).json({
          ...userResponse
        });
      } catch (error) {
        response.status(500).json({
          status: 500,
          message: 'Internal server error',
          data: error
        })
      }
    }
  }
 // Mettre à jour un utilisateur par ID (Admin uniquement)
 async updateUser(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const updates = request.body;
    const userResponse = await this.usersService.updateUser(id, updates);
    response.status(userResponse.status).json(userResponse);
  } catch (error) {
    response.status(500).json({ status: 500, message: 'Internal server error', data: error });
  }
}

// Mettre à jour les informations de l'utilisateur connecté
async updateConnectedUser(request: Request, response: Response): Promise<void> {
  try {
    const userId = request.userId;
    const updates = request.body;

    if (!userId) {
      response.status(400).json({ status: 400, message: 'User ID missing' });
      return;
    }

    const userResponse = await this.usersService.updateUser(userId, updates);

    response.status(userResponse.status).json({
      ...userResponse,
    });
  } catch (error) {
    response.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: error
    });
  }
}

// Supprimer un utilisateur par ID (Admin uniquement)
async deleteUser(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const userResponse = await this.usersService.deleteUser(id);
    response.status(userResponse.status).json(userResponse);
  } catch (error) {
    response.status(500).json({ status: 500, message: 'Internal server error', data: error });
  }
}

async changePassword(request: Request, response: Response): Promise<void> {
  try {
    const { currentPassword, newPassword } = request.body;
    const userId = request.userId;

    if (!userId) {
      response.status(400).json({ status: 400, message: 'User ID is missing' });
      return;
    }

    const userResponse = await this.usersService.changePassword(userId, currentPassword, newPassword);
    response.status(userResponse.status).json(userResponse);
  } catch (error) {
    response.status(500).json({ status: 500, message: 'Internal server error', data: error });
  }
}

async getUserActivity(request: Request, response: Response): Promise<void> {
  try {
    const { userId } = request.params;
    const activityResponse = await this.usersService.getUserActivity(userId);

    response.status(activityResponse.status).json({
      ...activityResponse,
    });
  } catch (error) {
    response.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: error,
    });
  }
}

async search(request: Request, response: Response): Promise<void> {
  try {
    const { query } = request.query; // Mot-clé de recherche
    const searchResults = await this.usersService.search(query as string);

    response.status(200).json(searchResults);
  } catch (error) {
    response.status(500).json({
      status: 500,
      message: 'Internal server error',
      data: error,
    });
  }
}

}
