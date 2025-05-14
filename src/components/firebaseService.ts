// firebaseService.ts
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
  } from 'firebase/firestore';
  import { 
    signInAnonymously, 
    onAuthStateChanged,
    User 
  } from 'firebase/auth';
  import { db, auth } from './firebaseConfig';
  import { PokemonCard } from './cardData';
  
  export interface SavedCard {
    id: string;
    owned: boolean;
  }
  
  export interface CollectionData {
    cards: SavedCard[];
    lastUpdated: string;
  }
  
  // Service for handling Firebase operations
  export class FirebaseService {
    private currentUser: User | null = null;
    private isInitialized = false;
  
    constructor() {
      // Listen to authentication state changes
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.isInitialized = true;
      });
    }
  
    // Wait for auth to initialize
    private async waitForInit(): Promise<void> {
      if (this.isInitialized) return;
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, () => {
          unsubscribe();
          this.isInitialized = true;
          resolve();
        });
      });
    }
  
    // Sign in anonymously (no need for email/password)
    async signInAnonymously(): Promise<User | null> {
      try {
        const result = await signInAnonymously(auth);
        this.currentUser = result.user;
        console.log('Signed in anonymously with user ID:', result.user.uid);
        return result.user;
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        return null;
      }
    }
  
    // Ensure user is authenticated
    private async ensureAuthenticated(): Promise<string | null> {
      await this.waitForInit();
      
      if (!this.currentUser) {
        const user = await this.signInAnonymously();
        if (!user) return null;
      }
      return this.currentUser!.uid;
    }
  
    // Save cards to Firestore
    async saveCards(cards: PokemonCard[]): Promise<boolean> {
      try {
        const userId = await this.ensureAuthenticated();
        if (!userId) {
          console.error('Could not authenticate user');
          return false;
        }
  
        // Convert cards to a format suitable for Firestore
        const collectionData: CollectionData = {
          cards: cards.map(card => ({
            id: card.id,
            owned: card.owned
          })),
          lastUpdated: new Date().toISOString()
        };
  
        // Save to Firestore
        await setDoc(doc(db, 'collections', userId), collectionData);
        console.log('Cards saved successfully');
        return true;
      } catch (error) {
        console.error('Error saving cards:', error);
        return false;
      }
    }
  
    // Load cards from Firestore
    async loadCards(): Promise<SavedCard[] | null> {
      try {
        const userId = await this.ensureAuthenticated();
        if (!userId) {
          console.error('Could not authenticate user');
          return null;
        }
  
        // Get document from Firestore
        const docRef = doc(db, 'collections', userId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data() as CollectionData;
          console.log('Cards loaded successfully');
          return data.cards || [];
        } else {
          console.log('No saved collection found');
          return null;
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        return null;
      }
    }
  
    // Get current user ID
    getUserId(): string | null {
      return this.currentUser?.uid || null;
    }
  
    // Get user status
    isUserSignedIn(): boolean {
      return this.currentUser !== null;
    }
  }
  
  // Export a singleton instance
  export const firebaseService = new FirebaseService();