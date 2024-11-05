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

  async updateUser(request: Request, response: Response): Promise<void> {
    try {
      const userId = request.params.id;
      const userData = request.body;

      const updatedUser = await this.usersService.updateUserById(userId, userData);

      if (updatedUser) {
        response.status(200).json({
          status: 200,
          message: 'User updated successfully',
          data: updatedUser,
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
      });
    }
  }

  async updateCurrentUser(request: Request, response: Response): Promise<void> {
    const userId = request.userId;

    // Vérification de la présence de userId
    if (!userId) {
      response.status(400).json({
        status: 400,
        message: 'User ID is required',
      });
      return;
    }

    try {
      const userData = request.body;
      const updatedUser = await this.usersService.updateUserById(userId, userData);

      if (updatedUser) {
        response.status(200).json({
          status: 200,
          message: 'User profile updated successfully',
          data: updatedUser,
        });
      } else {
        response.status(404).json({
          status: 404,
          message: 'User not found',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
  }

  async deleteUser(request: Request, response: Response): Promise<void> {
    try {
      const userId = request.params.id;

      const deletedUser = await this.usersService.deleteUserById(userId);

      if (deletedUser) {
        response.status(200).json({
          status: 200,
          message: 'User deleted successfully',
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
      });
    }
  }

  async changePassword(request: Request, response: Response): Promise<void> {
    const userId = request.userId;

    // Vérification de la présence de userId
    if (!userId) {
      response.status(400).json({
        status: 400,
        message: 'User ID is required',
      });
      return;
    }

    try {
      const { newPassword } = request.body;
      const passwordChanged = await this.usersService.changePassword(userId, newPassword);

      if (passwordChanged) {
        response.status(200).json({
          status: 200,
          message: 'Password changed successfully',
        });
      } else {
        response.status(404).json({
          status: 404,
          message: 'User not found',
        });
      }
    } catch (error) {
      response.status(500).json({
        status: 500,
        message: 'Internal server error',
        data: error,
      });
    }
}

async getActivityFeed(request: Request, response: Response): Promise<void> {
  const { userId } = request.params;
  const activityFeed = await this.usersService.getActivityFeed(userId);
  response.status(activityFeed.status).json(activityFeed);
}

}
