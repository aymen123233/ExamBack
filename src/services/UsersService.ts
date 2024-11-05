import { User } from '../types/entities/User';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import {comparePasswords, encryptPassword} from '../utils/password';
import { formatUserData } from '../utils/formatData';
import { generateToken } from '../utils/jwt';
import { RedisClientType } from 'redis';
import { Timestamp } from 'firebase/firestore';

export class UsersService {
  private db: FirestoreCollections;
  private redisClient: RedisClientType;

  constructor(db: FirestoreCollections, redisClient: RedisClientType) {
    this.db = db;
    this.redisClient = redisClient;
  }

  async createUser(userData: User): Promise<IResBody> {
    const usersQuerySnapshot = await this.db
      .users.where('email', '==', userData.email).get();

    if (usersQuerySnapshot.empty) {
      const userRef = this.db.users.doc();
      await userRef.set({
        ...userData,
        password: encryptPassword(userData.password as string),
        role: 'member',
        createdAt: firestoreTimestamp.now(),
        updatedAt: firestoreTimestamp.now(),
      });

      return {
        status: 201,
        message: 'User created successfully!',
      };
    } else {
      return {
        status: 409,
        message: 'User already exists',
      }
    }
  }

  async getUsers(): Promise<IResBody> {
    const cacheKey = 'users';
    let users: User[] = [];

    const cachedUsers = await this.redisClient.get(cacheKey);

    if(cachedUsers) {
      users = JSON.parse(cachedUsers);
    } else {
      const usersQuerySnapshot = await this.db.users.get();

      for (const doc of usersQuerySnapshot.docs) {
        const formattedUser = formatUserData(doc.data());

        users.push({
          id: doc.id,
          ...formattedUser,
        });
      }

      await this.redisClient.set(cacheKey, JSON.stringify(users), {
        EX: 3600
      });
    }

    return {
      status: 200,
      message: 'Users retrieved successfully!',
      data: users
    };
  }

  async login (userData: {email: string; password: string}): Promise<IResBody> {
    const { email, password } = userData;

    const usersQuerySnapshot = await this.db.users.where('email', '==', email).get();

    if (usersQuerySnapshot.empty) {
      return {
        status: 401,
        message: 'Unauthorized',
      }
    } else {
      const isPasswordValid = comparePasswords(
        password,
        usersQuerySnapshot.docs[0].data().password as string,
      );

      if (isPasswordValid) {
        const formattedUser = formatUserData(usersQuerySnapshot.docs[0].data());

        return {
          status: 200,
          message: 'User login successfully!',
          data: {
            user: {
              ...formattedUser
            },
            token: generateToken(usersQuerySnapshot.docs[0].id, formattedUser.role)
          }
        };
      } else {
        return {
          status: 401,
          message: 'Unauthorized!',
        }
      }
    }
  }

  async getUserById(userId: string): Promise<IResBody> {

    const userDoc = await this.db.users.doc(userId).get();
    const formattedUser = formatUserData(userDoc.data());

    return {
      status: 200,
      message: 'User retrieved successfully!',
      data: {
        id: userId,
        ...formattedUser
      }
    };
  }

  // Méthode pour mettre à jour un utilisateur
  async updateUser(userId: string, updates: Partial<User>): Promise<IResBody> {
    const userRef = this.db.users.doc(userId);

    try {
      await userRef.update({
        ...updates,
        updatedAt: firestoreTimestamp.now(),
      });

      const updatedUserDoc = await userRef.get();
      const formattedUser = formatUserData(updatedUserDoc.data());

      return {
        status: 200,
        message: 'User updated successfully!',
        data: { id: userId, ...formattedUser }
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to update user.',
        data: error
      };
    }
  }

  // Méthode pour supprimer un utilisateur
  async deleteUser(userId: string): Promise<IResBody> {
    const userRef = this.db.users.doc(userId);

    try {
      await userRef.delete();
      await this.redisClient.del('users'); // Invalidate cache for users list

      return {
        status: 200,
        message: 'User deleted successfully!',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to delete user.',
        data: error
      };
    }
  }

  // Méthode pour changer le mot de passe
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<IResBody> {
    const userRef = this.db.users.doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        status: 404,
        message: 'User not found.',
      };
    }

    const userData = userDoc.data() as User;

    // Vérifier si le mot de passe existe dans les données utilisateur
    if (!userData.password) {
      return {
        status: 500,
        message: 'User password is not set.',
      };
    }

    const isPasswordValid = comparePasswords(currentPassword, userData.password);

    if (!isPasswordValid) {
      return {
        status: 401,
        message: 'Current password is incorrect.',
      };
    }

    try {
      await userRef.update({
        password: encryptPassword(newPassword),
        updatedAt: firestoreTimestamp.now(),
      });

      return {
        status: 200,
        message: 'Password changed successfully!',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to change password.',
        data: error
      };
    }
  }

  async getUserActivity(userId: string): Promise<IResBody> {
    try {
      const posts: any[] = [];
      const comments: any[] = [];

      // Fetch posts created by the user
      const postsQuerySnapshot = await this.db.posts.where('createdBy', '==', userId).get();
      postsQuerySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        });
      });

      // Fetch comments created by the user
      const commentsQuerySnapshot = await this.db.comments.where('createdBy', '==', userId).get();
      commentsQuerySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        });
      });

      return {
        status: 200,
        message: 'User activity retrieved successfully!',
        data: {
          posts,
          comments,
        },
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to retrieve user activity.',
        data: error,
      };
    }
  }

  async search(keyword: string): Promise<IResBody> {
    try {
      const users: any[] = [];
      const posts: any[] = [];
      const comments: any[] = [];

      // Search users by username or email
      const usersQuerySnapshot = await this.db.users
        .where('username', '>=', keyword)
        .where('username', '<=', keyword + '\uf8ff')
        .get();

      usersQuerySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Search posts by title or description
      const postsQuerySnapshot = await this.db.posts
        .where('title', '>=', keyword)
        .where('title', '<=', keyword + '\uf8ff')
        .get();

      postsQuerySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        });
      });

      // Search comments by description
      const commentsQuerySnapshot = await this.db.comments
        .where('description', '>=', keyword)
        .where('description', '<=', keyword + '\uf8ff')
        .get();

      commentsQuerySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate(),
        });
      });

      return {
        status: 200,
        message: 'Search results retrieved successfully!',
        data: {
          users,
          posts,
          comments,
        },
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Failed to perform search.',
        data: error,
      };
    }
  }






}
