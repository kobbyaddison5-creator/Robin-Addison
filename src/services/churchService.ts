import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, ChurchClass, AttendanceRecord, WelfareRecord, DashboardStats } from '../types';

// --- Member ID Generation ---

export async function generateMemberId(): Promise<string> {
  const counterRef = doc(db, 'metadata', 'memberCounter');
  
  return await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    let nextId = 1;
    
    if (counterSnap.exists()) {
      nextId = counterSnap.data().count + 1;
    }
    
    transaction.set(counterRef, { count: nextId }, { merge: true });
    
    const paddedId = nextId.toString().padStart(4, '0');
    return `KMC-${paddedId}`;
  });
}

// --- Member Services ---

export const memberService = {
  async addMember(member: Omit<Member, 'id' | 'memberId' | 'createdAt'>) {
    try {
      const memberId = await generateMemberId();
      const createdAt = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'members'), {
        ...member,
        memberId,
        createdAt
      });
      return { id: docRef.id, memberId };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'members');
    }
  },

  async updateMember(id: string, member: Partial<Member>) {
    const docRef = doc(db, 'members', id);
    await updateDoc(docRef, member);
  },

  async deleteMember(id: string) {
    await deleteDoc(doc(db, 'members', id));
  },

  subscribeToMembers(callback: (members: Member[]) => void) {
    const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      callback(members);
    });
  }
};

// --- Class Services ---

export const classService = {
  async addClass(churchClass: Omit<ChurchClass, 'id'>) {
    await addDoc(collection(db, 'classes'), churchClass);
  },

  subscribeToClasses(callback: (classes: ChurchClass[]) => void) {
    return onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchClass));
      callback(classes);
    });
  }
};

// --- Attendance Services ---

export const attendanceService = {
  async recordAttendance(records: Omit<AttendanceRecord, 'id'>[]) {
    const batch = records.map(record => addDoc(collection(db, 'attendance'), record));
    await Promise.all(batch);
  },

  subscribeToAttendance(date: string, callback: (records: AttendanceRecord[]) => void) {
    const q = query(collection(db, 'attendance'), where('date', '==', date));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      callback(records);
    });
  }
};

// --- Welfare Services ---

export const welfareService = {
  async addWelfare(record: Omit<WelfareRecord, 'id'>) {
    try {
      await addDoc(collection(db, 'welfare'), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'welfare');
    }
  },

  subscribeToWelfare(callback: (records: WelfareRecord[]) => void) {
    const q = query(collection(db, 'welfare'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WelfareRecord));
      callback(records);
    });
  }
};
