export interface Vote {
  id?: string;
  entityId: string; // Post or Comment ID
  entityType: 'post' | 'comment';
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt?: Date;
}
