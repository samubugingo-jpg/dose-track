import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';

export interface AuditData {
  userId: string;
  recordId: string;
  action: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
}

export async function createDoseRecordWithAudit(userId: string, recordData: any) {
  const batch = writeBatch(db);
  const recordRef = doc(collection(db, 'doseRecords'));
  const auditRef = doc(collection(db, 'auditTrail'));

  const fullRecord = {
    ...recordData,
    userId,
    createdAt: serverTimestamp(),
  };

  batch.set(recordRef, fullRecord);
  
  batch.set(auditRef, {
    userId,
    recordId: recordRef.id,
    action: 'create',
    changes: fullRecord,
    timestamp: serverTimestamp(),
  });

  try {
    await batch.commit();
    return recordRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'doseRecords/auditTrail');
    throw error;
  }
}

export async function updateDoseRecordWithAudit(userId: string, recordId: string, updates: any) {
  const batch = writeBatch(db);
  const recordRef = doc(db, 'doseRecords', recordId);
  const auditRef = doc(collection(db, 'auditTrail'));

  // To calculate diff, we'd need to fetch the existing document.
  // In Firestore rules, we can check affectedKeys, but for the log we might want the values.
  
  batch.update(recordRef, updates);
  
  batch.set(auditRef, {
    userId,
    recordId,
    action: 'update',
    changes: updates, // For now, just log the updates sent
    timestamp: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'doseRecords/auditTrail');
    throw error;
  }
}

export async function deleteDoseRecordWithAudit(userId: string, recordId: string) {
  const batch = writeBatch(db);
  const recordRef = doc(db, 'doseRecords', recordId);
  const auditRef = doc(collection(db, 'auditTrail'));

  batch.delete(recordRef);
  
  batch.set(auditRef, {
    userId,
    recordId,
    action: 'delete',
    timestamp: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'doseRecords/auditTrail');
    throw error;
  }
}
