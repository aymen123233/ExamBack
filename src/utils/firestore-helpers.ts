import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

import { User } from '../types/entities/User';
import { Post } from '../types/entities/Post';
import { Comment } from '../types/entities/Comment';
import { FirestoreCollections } from '../types/firestore';

initializeApp({
  credential: cert({
    projectId: process.env.GCP_PROJECT_ID,
    clientEmail: process.env.GCP_CLIENT_EMAIL,
    privateKey: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

const firestore = getFirestore(process.env.FIRESTORE_DATABASE_ID as string);
const firestoreTimestamp = Timestamp;

const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: FirebaseFirestore.WithFieldValue<T>): FirebaseFirestore.DocumentData =>
    data as FirebaseFirestore.DocumentData,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
});

const dataPoint = <T>(collectionPath: string) =>
  firestore.collection(collectionPath).withConverter(converter<T>());

const db: FirestoreCollections = {
  users: dataPoint<User>('users'),
  posts: dataPoint<Post>('posts'),
  comments: dataPoint<Comment>('comments'),
};

export { db, firestore, firestoreTimestamp };
