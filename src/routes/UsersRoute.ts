import { Router } from 'express';
import { UserController } from '../controllers';
import { validateCreateUser, validateLoginUser } from '../middlewares/dataValidator';
import authJwt from '../middlewares/authJwt';

export class UsersRoute {
  private userController: UserController;

  constructor(userController: UserController) {
    this.userController = userController;
  }

  createRouter(): Router {
    const router = Router();

    router.post('/users', validateCreateUser, this.userController.createUser.bind(this.userController));
    router.get('/users', authJwt.verifyToken, this.userController.getUsers.bind(this.userController));

    router.get('/users/:id', authJwt.verifyToken, this.userController.getUserById.bind(this.userController));

    router.post('/auth/login', validateLoginUser, this.userController.login.bind(this.userController));


    // Partie examen :

    router.put('/users/:id', authJwt.verifyToken, this.userController.updateUser.bind(this.userController));
    router.put('/users/me', authJwt.verifyToken, this.userController.updateCurrentUser.bind(this.userController));
    router.delete('/users/:id', authJwt.verifyToken, this.userController.deleteUser.bind(this.userController));
    router.patch('/users/password', authJwt.verifyToken, this.userController.changePassword.bind(this.userController));



    router.get('/users/:userId/activity', authJwt.verifyToken, this.userController.getActivityFeed.bind(this.userController));

   // router.post('/auth/login', validateLoginUser, this.userController.login.bind(this.userController));
    return router;
  }
}
