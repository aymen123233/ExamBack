export interface Vote {
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: 'upvote' | 'downvote';
  createdAt?: FirebaseFirestore.Timestamp; // Add optional createdAt
}
