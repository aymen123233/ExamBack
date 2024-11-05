import { Router } from 'express';
import { UserController } from '../controllers';
import { validateCreateUser, validateLoginUser } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';
import { checkRole } from '../middlewares/authJwt';

export class UsersRoute {
  private userController: UserController;

  constructor(userController: UserController) {
    this.userController = userController;
  }

  createRouter(): Router {
    const router = Router();

    router.post('/users', validateCreateUser, this.userController.createUser.bind(this.userController));

    // Admin-only access
    router.get('/users', authJwt.verifyToken, checkRole('admin'), this.userController.getUsers.bind(this.userController));
    router.get('/users/:id', authJwt.verifyToken, checkRole('admin'), this.userController.getUserById.bind(this.userController));

    // Connected users access
    router.put('/users/me', authJwt.verifyToken, this.userController.updateConnectedUser.bind(this.userController));

    // Admin-only access
    router.put('/users/:id', authJwt.verifyToken, checkRole('admin'), this.userController.updateUser.bind(this.userController));
    router.delete('/users/:id', authJwt.verifyToken, checkRole('admin'), this.userController.deleteUser.bind(this.userController));

    // Change password for connected users
    router.patch('/users/password', authJwt.verifyToken, this.userController.changePassword.bind(this.userController));

    // Login route (no authentication required)
    router.post('/auth/login', validateLoginUser, this.userController.login.bind(this.userController));

    return router;
  }
}
