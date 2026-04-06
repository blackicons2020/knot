
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot,
    addDoc,
    serverTimestamp,
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db as firestoreDb, auth, handleFirestoreError, OperationType } from '../src/firebase';
import { User, Match, Message } from '../types';

// Helper to convert Firestore data to our types
const convertDoc = <T>(doc: any): T => ({ id: doc.id, ...doc.data() } as T);

class DatabaseService {
    // User Operations
    async getUser(uid: string): Promise<User | null> {
        try {
            const docRef = doc(firestoreDb, 'users', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? convertDoc<User>(docSnap) : null;
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
            return null;
        }
    }

    async saveUser(user: User): Promise<void> {
        try {
            const docRef = doc(firestoreDb, 'users', user.id);
            await setDoc(docRef, {
                ...user,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
        }
    }

    async updatePremiumStatus(uid: string, isPremium: boolean): Promise<void> {
        try {
            const docRef = doc(firestoreDb, 'users', uid);
            await updateDoc(docRef, { 
                isPremium,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
        }
    }

    // Matching Operations
    async getPotentialMatches(currentUser: User): Promise<Match[]> {
        try {
            // Get all users
            const q = query(
                collection(firestoreDb, 'users'),
                limit(100)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs
                .map(doc => convertDoc<User>(doc))
                .map(user => user as Match);
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, 'users');
            return [];
        }
    }

    async getLikedMatches(uid: string): Promise<Match[]> {
        try {
            const q = query(
                collection(firestoreDb, 'matches'),
                where('isMutual', '==', true),
                where('userIds', 'array-contains', uid)
            );
            const querySnapshot = await getDocs(q);
            
            // For each mutual match, get the other user's profile
            const matches: Match[] = [];
            for (const matchDoc of querySnapshot.docs) {
                const data = matchDoc.data();
                const otherUserId = data.userIds.find((id: string) => id !== uid);
                const otherUser = await this.getUser(otherUserId);
                if (otherUser) {
                    matches.push({
                        ...otherUser,
                        id: matchDoc.id // Use match ID for chat
                    } as Match);
                }
            }
            return matches;
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, 'matches');
            return [];
        }
    }

    async recordSwipe(swiperId: string, swipedId: string, type: 'like' | 'pass'): Promise<void> {
        try {
            const matchId = [swiperId, swipedId].sort().join('_');
            const matchRef = doc(firestoreDb, 'matches', matchId);
            
            const swipeData = {
                userIds: [swiperId, swipedId],
                [`swipes.${swiperId}`]: type,
                updatedAt: serverTimestamp()
            };

            await setDoc(matchRef, swipeData, { merge: true });

            // Check for mutual like
            if (type === 'like') {
                const matchSnap = await getDoc(matchRef);
                const data = matchSnap.data();
                if (data?.swipes?.[swipedId] === 'like') {
                    await updateDoc(matchRef, { 
                        isMutual: true,
                        matchedAt: serverTimestamp()
                    });
                }
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `matches`);
        }
    }

    // Messaging Operations
    subscribeToMessages(matchId: string, callback: (messages: Message[]) => void) {
        const q = query(
            collection(firestoreDb, 'messages'),
            where('matchId', '==', matchId),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date()
            } as Message));
            callback(messages);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'messages');
        });
    }

    async sendMessage(matchId: string, senderId: string, text: string): Promise<void> {
        try {
            await addDoc(collection(firestoreDb, 'messages'), {
                matchId,
                senderId,
                text,
                timestamp: serverTimestamp(),
                status: 'sent'
            });
            
            // Update last message in match
            const matchRef = doc(firestoreDb, 'matches', matchId);
            await updateDoc(matchRef, {
                lastMessage: text,
                lastMessageAt: serverTimestamp()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'messages');
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const q = query(collection(firestoreDb, 'users'), limit(100));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => convertDoc<User>(doc));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, 'users');
            return [];
        }
    }

    async seedMockData(mockMatches: Match[]): Promise<void> {
        try {
            for (const match of mockMatches) {
                const userRef = doc(firestoreDb, 'users', match.id);
                await setDoc(userRef, {
                    ...match,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'users/seed');
        }
    }

    async addGlobalMatches(newMatches: Match[]): Promise<void> {
        try {
            for (const match of newMatches) {
                const userRef = doc(firestoreDb, 'users', match.id);
                await setDoc(userRef, {
                    ...match,
                    isGlobal: true,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'users/global');
        }
    }

    async deleteUser(uid: string): Promise<void> {
        try {
            const docRef = doc(firestoreDb, 'users', uid);
            await deleteDoc(docRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
        }
    }
}

export const databaseService = new DatabaseService();
export const db = databaseService; // For backward compatibility
