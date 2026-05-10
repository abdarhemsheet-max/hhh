import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Transaction, TransactionType, Project, Budget, Debt } from '../types';

// Generic service class to handle common operations
export const DataService = {
  // Transactions
  subscribeTransactions: (userId: string, type: TransactionType, callback: (data: Transaction[]) => void) => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
  },

  addTransaction: async (userId: string, data: Partial<Transaction>) => {
    try {
      return await addDoc(collection(db, 'transactions'), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    try {
      const docRef = doc(db, 'transactions', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'transactions');
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'transactions');
    }
  },

  // Projects
  subscribeProjects: (userId: string, callback: (data: Project[]) => void) => {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
  },

  addProject: async (userId: string, data: Partial<Project>) => {
    try {
      return await addDoc(collection(db, 'projects'), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'projects');
    }
  },

  deleteProject: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'projects');
    }
  },

  // Budgets
  subscribeBudgets: (userId: string, callback: (data: Budget[]) => void) => {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });
  },

  addBudget: async (userId: string, data: Partial<Budget>) => {
    try {
      return await addDoc(collection(db, 'budgets'), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
    }
  },

  updateBudget: async (id: string, data: Partial<Budget>) => {
    try {
      await updateDoc(doc(db, 'budgets', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'budgets');
    }
  },

  deleteBudget: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'budgets');
    }
  },

  // Debts
  subscribeDebts: (userId: string, callback: (data: Debt[]) => void) => {
    const q = query(
      collection(db, 'debts'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      // Manual sort as a fallback for missing composite index
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'debts');
    });
  },

  addDebt: async (userId: string, data: Partial<Debt>) => {
    try {
      return await addDoc(collection(db, 'debts'), {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'debts');
    }
  },

  updateDebt: async (id: string, data: Partial<Debt>) => {
    try {
      await updateDoc(doc(db, 'debts', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'debts');
    }
  },

  deleteDebt: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'debts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'debts');
    }
  },

  // Monthly Expenses (for Budget/Dashboard)
  subscribeMonthlyExpenses: (userId: string, callback: (totals: Record<string, number>) => void) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('type', '==', 'EXPENSE'),
      where('date', '>=', startOfMonth.toISOString().split('T')[0])
    );

    return onSnapshot(q, (snapshot) => {
      const totals: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totals[data.category] = (totals[data.category] || 0) + data.amount;
      });
      callback(totals);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
  },

  // Dashboard Stats (Monthly)
  subscribeMonthlyStats: (userId: string, callback: (stats: any) => void) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    // Snapshot for transactions this month
    const qT = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', startOfMonth.toISOString().split('T')[0])
    );

    let stats = {
      income: 0,
      expense: 0,
      pendingIncome: 0
    };

    return onSnapshot(qT, (snapshot) => {
      let inc = 0;
      let exp = 0;
      let pendingInc = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'INCOME') {
          if (data.status === 'pending') pendingInc += data.amount;
          else inc += data.amount;
        } else {
          exp += data.amount;
        }
      });
      stats = { income: inc, expense: exp, pendingIncome: pendingInc };
      callback(stats);
    }, err => handleFirestoreError(err, OperationType.LIST, 'transactions'));
  },

  // Global Stats (All Time)
  subscribeGlobalStats: (userId: string, callback: (stats: any) => void) => {
    const qT = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const qP = query(
      collection(db, 'projects'),
      where('userId', '==', userId)
    );

    let stats = {
      income: 0,
      expense: 0,
      projects: 0,
      pendingIncome: 0
    };

    const unsubT = onSnapshot(qT, (snapshot) => {
      let inc = 0;
      let exp = 0;
      let pendingInc = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.type === 'INCOME') {
          if (data.status === 'pending') pendingInc += data.amount;
          else inc += data.amount;
        } else {
          exp += data.amount;
        }
      });
      stats = { ...stats, income: inc, expense: exp, pendingIncome: pendingInc };
      callback(stats);
    }, err => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    const unsubP = onSnapshot(qP, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => total += doc.data().amount);
      stats = { ...stats, projects: total };
      callback(stats);
    }, err => handleFirestoreError(err, OperationType.LIST, 'projects'));

    return () => { unsubT(); unsubP(); };
  }
};
