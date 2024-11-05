import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { Comment } from '../types/entities/Comment';
import { firestoreTimestamp } from '../utils/firestore-helpers';

export class CommentsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async getCommentsByPost(postId: string): Promise<IResBody> {
    const comments: Comment[] = [];
    const commentsQuerySnapshot = await this.db.comments.where('postId', '==', postId).get();

    commentsQuerySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      status: 200,
      message: 'Comments retrieved successfully!',
      data: comments,
    };
  }

  async getCommentById(commentId: string): Promise<IResBody> {
    const commentDoc = await this.db.comments.doc(commentId).get();
    if (!commentDoc.exists) {
      return { status: 404, message: 'Comment not found', data: null };
    }

    return {
      status: 200,
      message: 'Comment retrieved successfully!',
      data: commentDoc.data(),
    };
  }

  async addComment(commentData: Comment): Promise<IResBody> {
    const commentRef = this.db.comments.doc();
    await commentRef.set({
      ...commentData,
      createdAt: firestoreTimestamp.now(),
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 201,
      message: 'Comment added successfully!',
    };
  }

  async updateComment(commentId: string, commentData: Partial<Comment>): Promise<IResBody> {
    const commentRef = this.db.comments.doc(commentId);
    const commentDoc = await commentRef.get();
    if (!commentDoc.exists) {
      return { status: 404, message: 'Comment not found' };
    }

    await commentRef.update({
      ...commentData,
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 200,
      message: 'Comment updated successfully!',
    };
  }

  async deleteComment(commentId: string): Promise<IResBody> {
    const commentRef = this.db.comments.doc(commentId);
    const commentDoc = await commentRef.get();
    if (!commentDoc.exists) {
      return { status: 404, message: 'Comment not found' };
    }

    await commentRef.delete();

    return {
      status: 200,
      message: 'Comment deleted successfully!',
    };
  }


  async voteOnComment(commentId: string, voteType: 'upvote' | 'downvote', userId: string): Promise<IResBody> {
    const commentRef = this.db.comments.doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return { status: 404, message: 'Comment not found' };
    }

    const currentVoteCount = commentDoc.data()?.voteCount || 0;
    const newVoteCount = voteType === 'upvote' ? currentVoteCount + 1 : currentVoteCount - 1;

    await commentRef.update({ voteCount: newVoteCount });

    return {
      status: 200,
      message: 'Vote registered successfully',
      data: { voteCount: newVoteCount },
    };
  }
}
