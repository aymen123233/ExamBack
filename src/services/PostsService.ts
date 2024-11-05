import { Post } from '../types/entities/Post';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';
import { Timestamp } from 'firebase/firestore';

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
      data: { id: postRef.id, ...postData }
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

  async getPostById(postId: string): Promise<IResBody> {
    const postDoc = await this.db.posts.doc(postId).get();

    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    return { status: 200, message: 'Post retrieved successfully!', data: { id: postId, ...postDoc.data() } };
  }

  async updatePost(postId: string, userId: string, postData: Partial<Post>): Promise<IResBody> {
    const postDoc = await this.db.posts.doc(postId).get();

    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    if (postDoc.data()?.createdBy !== userId) {
      return { status: 403, message: 'Forbidden: You are not the owner of this post' };
    }

    await this.db.posts.doc(postId).update({
      ...postData,
      updatedAt: firestoreTimestamp.now(),
    });

    return { status: 200, message: 'Post updated successfully!', data: { id: postId, ...postData } };
  }

  async deletePost(postId: string, userId: string): Promise<IResBody> {
    const postDoc = await this.db.posts.doc(postId).get();

    if (!postDoc.exists) {
      return { status: 404, message: 'Post not found' };
    }

    if (postDoc.data()?.createdBy !== userId) {
      return { status: 403, message: 'Forbidden: You are not the owner of this post' };
    }

    await this.db.posts.doc(postId).delete();

    return { status: 200, message: 'Post deleted successfully!' };
  }

  async getAllPostsByUser(userId: string): Promise<IResBody> {
    const postsQuerySnapshot = await this.db.posts.where('createdBy', '==', userId).get();
    const posts = postsQuerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
    }));

    return { status: 200, message: 'Posts retrieved successfully!', data: posts };
  }

  async getPostsByCategory(category: string): Promise<IResBody> {
    const postsQuerySnapshot = await this.db.posts.where('categories', 'array-contains', category.toLowerCase()).get();
    const posts = postsQuerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data()?.createdAt as Timestamp)?.toDate(),
      updatedAt: (doc.data()?.updatedAt as Timestamp)?.toDate(),
    }));

    return { status: 200, message: 'Posts retrieved successfully!', data: posts };
  }

  async search(query: string, type: string): Promise<IResBody> {
    const collection = this.db[type === 'post' ? 'posts' : type === 'comment' ? 'comments' : 'users'];
    const results = await collection.where('content', 'array-contains', query).get();

    return {
      status: 200,
      message: 'Search results retrieved successfully!',
      data: results.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }

  async getTrendingPosts(): Promise<IResBody> {
    const posts = await this.db.posts.orderBy('upvotes', 'desc').limit(10).get();
    return {
      status: 200,
      message: 'Trending posts retrieved successfully!',
      data: posts.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }

  async getFilteredPosts(category: string, sortBy: string): Promise<IResBody> {
    let query: FirebaseFirestore.Query<Post>; // Declare the query type explicitly
    query = this.db.posts; // Initialize with the collection reference

    if (category) {
      query = query.where('category', '==', category); // Apply filter
    }
    if (sortBy) {
      query = query.orderBy(sortBy); // Apply sorting
    }

    const postsQuerySnapshot = await query.get(); // Execute the query
    return {
      status: 200,
      message: 'Filtered posts retrieved successfully!',
      data: postsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    };
  }



}
