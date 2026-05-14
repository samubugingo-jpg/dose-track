import { useState, useEffect } from 'react';
import { Eye, Download, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { exportDoseReport } from '../lib/pdfExport';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { deleteDoseRecordWithAudit } from '../services/auditService';
import { cn } from '../lib/utils';

export default function Records() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (recordId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this record? This action will be audited.')) return;
    try {
      await deleteDoseRecordWithAudit(user.uid, recordId);
    } catch (error) {
      // Error handled in service
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const path = 'doseRecords';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-accent font-bold">Synchronized</span>
          </div>
          <h2 className="text-5xl serif-title italic text-on-surface/90 leading-tight">Registry of <br/>Dosimetry</h2>
          <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface/30 mt-6 font-light">Comprehensive clinical exposure logs for Rwanda National Standards</p>
        </div>
        <div className="flex gap-4">
          <button className="h-14 px-8 border border-on-surface/20 text-on-surface text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-on-surface hover:text-surface transition-all">
            Filter Results
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center gap-6">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-[10px] uppercase tracking-[0.4em] text-on-surface/20">Accessing Archives...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-32 flex flex-col items-center justify-center gap-8">
              <div className="w-16 h-16 border border-on-surface/10 flex items-center justify-center">
                <Eye size={24} className="text-on-surface/10" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface/20 text-center leading-relaxed font-light">
                No clinical records found.<br/>The ledger awaits your first entry.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-on-surface/[0.03] text-on-surface/40 uppercase tracking-[0.2em] text-[8px]">
                <tr>
                  <th className="px-10 py-6 font-medium">Identifier</th>
                  <th className="px-10 py-6 font-medium">Temporal Marker</th>
                  <th className="px-10 py-6 font-medium">Classification</th>
                  <th className="px-10 py-6 font-medium">Index (mGy)</th>
                  <th className="px-10 py-6 font-medium">Product (mGy·cm)</th>
                  <th className="px-10 py-6 font-medium">Metric</th>
                  <th className="px-10 py-6 font-medium text-right">Instruments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/5 text-[11px]">
                <AnimatePresence>
                  {records.map((record, index) => (
                    <motion.tr 
                      key={record.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-on-surface/[0.01] transition-colors group"
                    >
                      <td className="px-10 py-8 text-accent font-medium tracking-widest">{record.patientId}</td>
                      <td className="px-10 py-8 text-on-surface/30 font-light italic serif-title text-sm">{record.examDate}</td>
                      <td className="px-10 py-8 text-on-surface/60 uppercase tracking-widest text-[9px]">{record.examType}</td>
                      <td className={cn("px-10 py-8 font-medium", record.drlExceeded && "text-accent font-bold")}>{record.ctdiVol}</td>
                      <td className={cn("px-10 py-8 font-medium", record.drlExceeded && "text-accent font-bold")}>{record.dlp}</td>
                      <td className="px-10 py-8">
                        <span className={cn(
                          "px-3 py-1 border text-[8px] uppercase tracking-widest",
                          record.drlExceeded ? "border-accent/40 text-accent font-bold" : "border-on-surface/10 text-on-surface/40"
                        )}>
                          {record.drlExceeded ? 'Exceeds' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-on-surface/40 hover:text-accent transition-colors" title="Inspect">
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => exportDoseReport(record)}
                            className="flex items-center gap-2 text-on-surface/40 hover:text-on-surface transition-colors text-[9px] uppercase tracking-widest" title="Extract PDF"
                          >
                            <Download size={14} />
                            EXTRACT
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="text-on-surface/40 hover:text-error transition-colors" title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
        <div className="px-10 py-8 border-t border-on-surface/5 flex justify-between items-center bg-on-surface/[0.01]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface/20 font-light">Listing {records.length} Registry Entries</span>
          <div className="flex gap-4">
            <button className="h-10 px-6 border border-on-surface/10 text-on-surface/20 text-[9px] uppercase tracking-widest cursor-not-allowed">Previous</button>
            <button className="h-10 px-6 border border-on-surface/10 text-on-surface/60 text-[9px] uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-all">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
