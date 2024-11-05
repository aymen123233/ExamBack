import { Vote } from '../types/entities/Vote';
import { FirestoreCollections } from '../types/firestore';
import { IResBody } from '../types/api';
import { Firestore, FieldValue } from 'firebase-admin/firestore';

export class VotesService {
  private db: FirestoreCollections;

  constructor(db: FirestoreCollections) {
    this.db = db;
  }

  // Cast a vote on a post or comment
  async castVote(vote: Vote): Promise<IResBody> {
    const { userId, targetId, targetType, voteType } = vote;
    const targetRef = this.db[targetType === 'post' ? 'posts' : 'comments'].doc(targetId);
    const voteIncrement = voteType === 'upvote' ? 1 : -1;

    try {
      // Check if target exists
      const targetDoc = await targetRef.get();
      if (!targetDoc.exists) {
        return {
          status: 404,
          message: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} not found.`,
        };
      }

      // Update vote count
      await targetRef.update({
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: FieldValue.increment(voteIncrement),
      });

      // Record the vote (e.g., in a separate votes collection if tracking each vote individually)
      const voteRef = this.db.votes.doc();
      await voteRef.set({
        userId,
        targetId,
        targetType,
        voteType,
        //createdAt: Firestore.Timestamp.now(),
      });

      return {
        status: 200,
        message: `Vote recorded successfully!`,
        data: { userId, targetId, targetType, voteType },
      };
    } catch (error) {
      console.error("Error recording vote:", error);
      return {
        status: 500,
        message: 'Failed to record vote.',
      };
    }
  }
}
