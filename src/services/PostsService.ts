import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { Timestamp } from 'firebase/firestore';
import { categories } from '../constants/categories';

export class PostsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async createPost(postData: Post): Promise<IResBody> {
    const postRef = this.db.posts.doc();
    await postRef.set({
      ...postData,
      voteCount: 0,
      createdAt: firestoreTimestamp.now(),
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 201,
      message: 'Post created successfully!',
    };
  }

  async getPosts(): Promise<IResBody> {
    const posts: Post[] = [];
    const postsQuerySnapshot = await this.db.posts.get();

    for (const doc of postsQuerySnapshot.docs) {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    }

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }

  async getCategories(): Promise<IResBody> {
    return {
      status: 200,
      message: 'Categories retrieved successfully!',
      data: categories
    };
  }

  async addCommentToPost(commentData: any, postId: string): Promise<IResBody> {
    // logic to add comment
    return {
      status: 200,
      message: 'Comment added successfully!',
      data: categories
    };
  }

  async getPostById(postId: string): Promise<IResBody> {
    const postDoc = await this.db.posts.doc(postId).get();
    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    return {
      status: 200,
      message: 'Post retrieved successfully!',
      data: postDoc.data()
    };
  }

  async updatePost(postId: string, postData: any): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    await postRef.update({
      ...postData,
      updatedAt: firestoreTimestamp.now()
    });

    return { status: 200, message: 'Post updated successfully!' };
  }

  async deletePost(postId: string): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    await postRef.delete();
    return { status: 200, message: 'Post deleted successfully!' };
  }

  async getPostsByUser(userId: string): Promise<IResBody> {
    const posts: any[] = [];
    const postsQuerySnapshot = await this.db.posts.where('createdBy', '==', userId).get();

    postsQuerySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    });

    return {
      status: 200,
      message: 'Posts retrieved successfully!',
      data: posts
    };
  }

  async getPostsByCategory(category: string): Promise<IResBody> {
    const posts: any[] = [];
    const postsQuerySnapshot = await this.db.posts.where('categories', 'array-contains', category).get();

    postsQuerySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    });

    return {
      status: 200,
      message: 'Posts by category retrieved successfully!',
      data: posts
    };
  }

  async voteOnPost(postId: string, vote: 'upvote' | 'downvote'): Promise<IResBody> {
    const postRef = this.db.posts.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    const currentVoteCount = postDoc.data()?.voteCount || 0;
    const newVoteCount = vote === 'upvote' ? currentVoteCount + 1 : currentVoteCount - 1;

    await postRef.update({ voteCount: newVoteCount });

    return {
      status: 200,
      message: 'Vote registered successfully',
      data: { voteCount: newVoteCount },
    };
  }


  async getTrendingPosts(): Promise<IResBody> {
    const posts: Post[] = [];
    const postsQuerySnapshot = await this.db.posts
      .orderBy('voteCount', 'desc') // Sort by highest vote count
      .limit(10) // Limit to top 10 posts
      .get();

    postsQuerySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
        updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
      });
    });

    return {
      status: 200,
      message: 'Trending posts retrieved successfully!',
      data: posts,
    };
  }

}
