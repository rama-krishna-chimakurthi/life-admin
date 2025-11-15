// src/services/FirebaseService.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';

export class FirebaseService {
  // Auth methods
  static async signIn(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  static async signUp(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  static async signOut() {
    return await firebaseSignOut(auth);
  }

  static onAuthStateChanged(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Firestore methods
  static async addDocument(collectionName: string, data: any) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    return await addDoc(collection(db, `users/${userId}/${collectionName}`), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static async updateDocument(collectionName: string, docId: string, data: any) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    return await updateDoc(doc(db, `users/${userId}/${collectionName}`, docId), {
      ...data,
      updatedAt: new Date()
    });
  }

  static async deleteDocument(collectionName: string, docId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    return await deleteDoc(doc(db, `users/${userId}/${collectionName}`, docId));
  }

  static async getDocuments(collectionName: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, `users/${userId}/${collectionName}`),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static subscribeToCollection(collectionName: string, callback: (data: any[]) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, `users/${userId}/${collectionName}`),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  }
}