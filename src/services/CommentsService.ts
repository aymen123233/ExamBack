import { Comment } from '../types/entities/Comment';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { firestoreTimestamp } from '../utils/firestore-helpers';

export class CommentsService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  async addComment(commentData: Comment): Promise<IResBody> {
    const commentRef = this.db.comments.doc();
    await commentRef.set({
      ...commentData,
      upvotes: 0,
      downvotes: 0,
      createdAt: firestoreTimestamp.now(),
      updatedAt: firestoreTimestamp.now(),
    });

    return {
      status: 201,
      message: 'Comment added successfully!',
    };
  }

  // CommentsService.ts
async getCommentsByPostId(postId: string): Promise<IResBody> {
  if (!postId) {
    return {
      status: 400,
      message: 'Post ID is required.',
      data: [],
    };
  }

  try {
    const commentsSnapshot = await this.db.comments.where('postId', '==', postId).get();
    const comments: Comment[] = [];

    commentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data) {
        const formattedComment = formatCommentData({ id: doc.id, ...data });
        comments.push(formattedComment);
      }
    });

    return {
      status: 200,
      message: 'Comments retrieved successfully!',
      data: comments,
    };
  } catch (error) {
    console.error("Error retrieving comments by post ID:", error);
    return {
      status: 500,
      message: 'Failed to retrieve comments.',
      data: [],
    };
  }
}



  async updateComment(id: string, content: string): Promise<IResBody> {
    const commentDoc = await this.db.comments.doc(id).get();

    if (!commentDoc.exists) {
      return {
        status: 404,
        message: 'Comment not found',
      };
    }

    await this.db.comments.doc(id).update({
      content,
      updatedAt: firestoreTimestamp.now(),
    });

    const updatedComment = await this.db.comments.doc(id).get();
    const data = updatedComment.data(); // Récupération des données

    if (!data) {
      return {
        status: 500,
        message: 'Failed to retrieve updated comment data',
      };
    }

    const formattedComment = formatCommentData(data);

    return {
      status: 200,
      message: 'Comment updated successfully!',
      data: {
        id,
        ...formattedComment,
      },
    };
  }
  async getAllComments(): Promise<IResBody> {
    try {
      const commentsSnapshot = await this.db.comments.get();
      const comments: Comment[] = commentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return formatCommentData({ id: doc.id, ...data });
      });

      return {
        status: 200,
        message: 'All comments retrieved successfully!',
        data: comments,
      };
    } catch (error) {
      console.error("Error retrieving all comments:", error);
      return {
        status: 500,
        message: 'Failed to retrieve comments.',
        data: [],
      };
    }
  }
  async deleteComment(id: string): Promise<IResBody> {
    const commentDoc = await this.db.comments.doc(id).get();

    if (!commentDoc.exists) {
      return {
        status: 404,
        message: 'Comment not found',
      };
    }

    await this.db.comments.doc(id).delete();

    return {
      status: 200,
      message: 'Comment deleted successfully!',
    };
  }

  async getTopComments(): Promise<IResBody> {
    const comments = await this.db.comments.orderBy('upvotes', 'desc').limit(10).get();
    return {
      status: 200,
      message: 'Top comments retrieved successfully!',
      data: comments.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }

}

function formatCommentData(data: FirebaseFirestore.DocumentData): Comment {
  return {
    id: data.id,
    postId: data.postId,
    userId: data.userId,
    content: data.content,
    upvotes: data.upvotes || 0,
    downvotes: data.downvotes || 0,
    createdAt: data.createdAt || firestoreTimestamp.now(),
    updatedAt: data.updatedAt || firestoreTimestamp.now(),
  };


}




