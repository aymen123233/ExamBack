import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id?: string;
  postId: string;
  description: string;
  createdBy: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;  // Add this line
  voteCount?: number;
}
