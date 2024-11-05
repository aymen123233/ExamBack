import { firestore } from 'firebase-admin';
import CollectionReference = firestore.CollectionReference;
import DocumentData = firestore.DocumentData;

import { User } from './entities/User';
import { Post } from './entities/Post';
import { Comment } from './entities/Comment';

export interface FirestoreCollections {
  users: CollectionReference<User, DocumentData>;
  posts: CollectionReference<Post, DocumentData>;
 comments:CollectionReference<Comment, DocumentData>;

}
