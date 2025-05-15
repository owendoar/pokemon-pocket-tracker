// firebaseService.ts - Updated for multi-set support
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs 
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { PokemonCard, PokemonCardSet } from './cardData';

export interface SavedCard {
  id: string;
  owned: boolean;
}

export interface SetCollectionData {
  cards: SavedCard[];
  lastUpdated: string;
  setName: string;
}

// Service for handling Firebase operations with multi-set support
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

  // Save cards for a specific set to Firestore
  async saveCardsForSet(setId: string, set: PokemonCardSet): Promise<boolean> {
    try {
      const userId = await this.ensureAuthenticated();
      if (!userId) {
        console.error('Could not authenticate user');
        return false;
      }

      // Convert set to a format suitable for Firestore
      const collectionData: SetCollectionData = {
        cards: set.cards.map(card => ({
          id: card.id,
          owned: card.owned
        })),
        lastUpdated: new Date().toISOString(),
        setName: set.name
      };

      // Save to Firestore under collections/{userId}/sets/{setId}
      await setDoc(doc(db, 'collections', userId, 'sets', setId), collectionData);
      console.log(`Cards saved successfully for set ${setId}`);
      return true;
    } catch (error) {
      console.error(`Error saving cards for set ${setId}:`, error);
      return false;
    }
  }

  // Load cards for a specific set from Firestore
  async loadCardsForSet(setId: string): Promise<SavedCard[] | null> {
    try {
      const userId = await this.ensureAuthenticated();
      if (!userId) {
        console.error('Could not authenticate user');
        return null;
      }

      // Get document from Firestore
      const docRef = doc(db, 'collections', userId, 'sets', setId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SetCollectionData;
        console.log(`Cards loaded successfully for set ${setId}`);
        return data.cards || [];
      } else {
        console.log(`No saved collection found for set ${setId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error loading cards for set ${setId}:`, error);
      return null;
    }
  }

  // Get all saved set IDs for the current user
  async getSavedSetIds(): Promise<string[]> {
    try {
      const userId = await this.ensureAuthenticated();
      if (!userId) return [];

      const setsRef = collection(db, 'collections', userId, 'sets');
      const snapshot = await getDocs(setsRef);
      
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching saved set IDs:', error);
      return [];
    }
  }

  // Get metadata for a specific set (name, last updated)
  async getSetMetadata(setId: string): Promise<{name: string, lastUpdated: string} | null> {
    try {
      const userId = await this.ensureAuthenticated();
      if (!userId) return null;

      const docRef = doc(db, 'collections', userId, 'sets', setId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as SetCollectionData;
        return {
          name: data.setName,
          lastUpdated: data.lastUpdated
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching metadata for set ${setId}:`, error);
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