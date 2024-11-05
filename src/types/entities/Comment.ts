import { Timestamp } from 'firebase/firestore';

export interface Comment {
  id?: string;
  postId: string;
  userId: string;
  content: string;
  upvotes?: number;
  downvotes?: number;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}
