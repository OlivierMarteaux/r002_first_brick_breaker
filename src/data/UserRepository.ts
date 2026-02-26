import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  setDoc,
  getDoc
} from "firebase/firestore";
import { db, isConfigured } from "./firebase";
import { User } from "../domain/models";

export class UserRepository {
  private collectionName = "users";

  async getAllScores(): Promise<User[]> {
    if (!isConfigured || !db) {
      console.log("Using dummy scores (Firebase not configured)");
      return this.getDummyScores();
    }

    try {
      const q = query(
        collection(db, this.collectionName), 
        orderBy("score", "asc"), 
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error("Error fetching scores:", error);
      return this.getDummyScores();
    }
  }

  private getDummyScores(): User[] {
    return [
      { id: "1", email: "pro@gamer.com", pseudo: "ProGamer", score: 4500 },
      { id: "2", email: "speed@run.com", pseudo: "SpeedRunner", score: 5200 },
      { id: "3", email: "brick@master.com", pseudo: "BrickMaster", score: 6800 },
    ];
  }

  async updateScore(userId: string, newScore: number): Promise<void> {
    if (!isConfigured || !db) return;

    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentScore = userSnap.data().score || Infinity;
        if (newScore < currentScore) {
          await updateDoc(userRef, { score: newScore });
        }
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  }

  async createUserProfile(user: Partial<User>): Promise<void> {
    if (!isConfigured || !db || !user.id) return;
    try {
      const userRef = doc(db, this.collectionName, user.id);
      await setDoc(userRef, {
        email: user.email,
        pseudo: user.pseudo || user.email?.split('@')[0],
        score: user.score || 999999
      }, { merge: true });
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    if (!isConfigured || !db || !userId) return null;

    try {
      const userRef = doc(db, this.collectionName, userId);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();

      return {
        id: userId,
        email: data.email ?? '',
        pseudo: data.pseudo ?? 'Player',
        score: data.score ?? 999999
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  
}

export const userRepository = new UserRepository();
