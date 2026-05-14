import { useState, useEffect, useCallback } from 'react';
import { User, Activity, Zap, Info, ShieldCheck, BrainCircuit, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { predictEffectiveDose } from '../services/predictionService';
import { checkDrlExceedance } from '../lib/drl';
import { motion, AnimatePresence } from 'motion/react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { createDoseRecordWithAudit } from '../services/auditService';
import { useAuth } from '../lib/AuthContext';

export default function NewEntry() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: '',
    examDate: new Date().toISOString().split('T')[0],
    examType: '',
    ctdiVol: '',
    dlp: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [prediction, setPrediction] = useState({
    dose: 0,
    confidence: 0,
    insight: 'Enter parameters to see prediction...',
    compliance: 'Pending'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = useCallback(async () => {
    if (!formData.ctdiVol || !formData.dlp || !formData.examType) return;
    
    setLoading(true);
    try {
      const res = await predictEffectiveDose({
        ctdiVol: parseFloat(formData.ctdiVol),
        dlp: parseFloat(formData.dlp),
        examType: formData.examType
      });
      
      const isExceeded = checkDrlExceedance(formData.examType, parseFloat(formData.dlp));
      
      setPrediction({
        dose: res.dose,
        confidence: res.confidence,
        insight: res.insight,
        compliance: isExceeded ? 'Exceeds DRLs' : 'Within Limits'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [formData.ctdiVol, formData.dlp, formData.examType]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await createDoseRecordWithAudit(user.uid, {
        patientId: formData.patientId,
        examDate: formData.examDate,
        examType: formData.examType,
        ctdiVol: parseFloat(formData.ctdiVol),
        dlp: parseFloat(formData.dlp),
        effectiveDose: prediction.dose,
        drlExceeded: prediction.compliance === 'Exceeds DRLs',
      });
      setSaved(true);
      setFormData({
        patientId: '',
        examDate: new Date().toISOString().split('T')[0],
        examType: '',
        ctdiVol: '',
        dlp: '',
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // Error handled in service
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handlePredict();
    }, 1000);
    return () => clearTimeout(timer);
  }, [handlePredict]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <div className="mb-0">
        <h2 className="text-5xl serif-title italic text-on-surface/90 leading-tight">Exclusive <br/>Registry Entry</h2>
        <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface/30 mt-6 font-light">Precision dosimetry input for neurological and clinical validation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form */}
        <div className="lg:col-span-8 space-y-8">
          <section className="glass-panel p-10 space-y-10 shadow-sm">
            <div className="flex items-center justify-between border-b border-on-surface/10 pb-6">
              <h3 className="serif-title text-xl font-light italic text-accent flex items-center gap-4">
                <User size={20} className="text-accent" />
                Biological Identification
              </h3>
              <span className="text-[9px] font-medium text-on-surface/20 uppercase tracking-[0.3em]">Patient Archives</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.2em] ml-1">Registry Identifier</label>
                <input
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  placeholder="RW-202X-XXXX"
                  className="w-full bg-on-surface/5 border border-on-surface/10 rounded-none px-4 py-4 text-sm text-on-surface placeholder:text-on-surface/10 focus:outline-none focus:border-accent/40 transition-all font-light"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.2em] ml-1">Temporal Alignment</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                  className="w-full bg-on-surface/5 border border-on-surface/10 rounded-none px-4 py-4 text-sm text-on-surface focus:outline-none focus:border-accent/40 transition-all font-light appearance-none"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.2em] ml-1">Clinical Classification</label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className="w-full bg-on-surface/5 border border-on-surface/10 rounded-none px-4 py-4 text-sm text-on-surface focus:outline-none focus:border-accent/40 transition-all font-light appearance-none"
                >
                  <option value="" className="bg-surface text-on-surface">Select Protocol</option>
                  <option value="head" className="bg-surface text-on-surface">Head (Routine Cerebral)</option>
                  <option value="chest" className="bg-surface text-on-surface">Chest (Thoracic Multi-phase)</option>
                  <option value="abdomen" className="bg-surface text-on-surface">Abdomen-Pelvis (Visceral)</option>
                  <option value="cardiac" className="bg-surface text-on-surface">Cardiac (Arterial Evaluation)</option>
                  <option value="spine" className="bg-surface text-on-surface">Cervical Spine (Osseous)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="glass-panel p-10 space-y-10 shadow-sm">
            <div className="flex items-center justify-between border-b border-on-surface/10 pb-6">
              <h3 className="serif-title text-xl font-light italic text-accent flex items-center gap-4">
                <Activity size={20} className="text-accent" />
                Exposure Metrics
              </h3>
              <span className="text-[9px] font-medium text-on-surface/20 uppercase tracking-[0.3em]">Scanner Instrumentation</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.2em] ml-1">CTDI VOL Marker</label>
                <div className="relative">
                  <input
                    type="number"
                    name="ctdiVol"
                    value={formData.ctdiVol}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-on-surface/5 border border-on-surface/10 rounded-none px-4 py-4 text-sm text-on-surface placeholder:text-on-surface/10 focus:outline-none focus:border-accent/40 transition-all font-light pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-medium text-on-surface/20 uppercase">mGy</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.2em] ml-1">DLP Multiplier</label>
                <div className="relative">
                  <input
                    type="number"
                    name="dlp"
                    value={formData.dlp}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-on-surface/5 border border-on-surface/10 rounded-none px-4 py-4 text-sm text-on-surface placeholder:text-on-surface/10 focus:outline-none focus:border-accent/40 transition-all font-light pr-20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-medium text-on-surface/20 uppercase tracking-widest">mGy·cm</span>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-on-surface/10 flex justify-end gap-6">
              <button className="h-14 px-10 border border-on-surface/10 text-on-surface/40 text-[10px] uppercase tracking-[0.3em] font-medium hover:text-accent transition-all">
                Dismiss
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !formData.patientId}
                className={cn(
                  "h-14 px-10 font-bold text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 relative overflow-hidden group shadow-sm",
                  saved ? "bg-accent text-white" : "bg-on-surface text-surface hover:bg-accent hover:text-white",
                  (saving || !formData.patientId) && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : saved ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} className="group-hover:translate-y-[-2px] transition-transform" />
                )}
                {saving ? 'Processing' : saved ? 'Committed' : 'Commit to archives'}
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Prediction */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-36">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-panel p-10 relative overflow-hidden group bg-on-surface/[0.01] shadow-sm"
          >
            <motion.div 
              animate={{ 
                top: ["-50%", "150%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent z-20 pointer-events-none"
            />
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h3 className="serif-title text-lg font-light italic flex items-center gap-3 tracking-widest border-b border-accent/20 pb-2 text-on-surface">
                <BrainCircuit size={18} className="text-accent" />
                Neural Synthesis
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                <span className="text-[8px] text-accent uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-[8px] font-medium text-on-surface/20 uppercase tracking-[0.4em] mb-4">Geometric Mean Prediction</p>
                <div className="flex items-baseline gap-4">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="animate-spin text-accent" size={32} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prediction"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-baseline gap-4"
                      >
                        <span className="text-6xl serif-title italic text-accent font-light">{prediction.dose}</span>
                        <span className="text-sm font-light text-on-surface/40 serif-title italic">mSv</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-8 h-[1px] w-full bg-on-surface/10 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((prediction.dose / 15) * 100, 100)}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className="bg-accent h-full absolute top-0 left-0 shadow-[0_0_15px_rgba(14, 165, 233, 0.5)]" 
                  ></motion.div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-on-surface/20">Regulatory Compliance</span>
                  <span className={cn("text-[9px] uppercase tracking-widest font-bold", prediction.compliance === 'Exceeds DRLs' ? "text-error" : "text-accent")}>{prediction.compliance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-on-surface/20">Variance Metric</span>
                  <span className={cn("text-[9px] uppercase tracking-widest font-bold", prediction.dose > 10 ? "text-error" : "text-on-surface/60")}>
                    {prediction.dose > 10 ? 'Elevated' : 'Sub-critical'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase tracking-[0.4em] text-on-surface/20">System Confidence</span>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface/60">{prediction.confidence.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-6 bg-on-surface/[0.02] border border-on-surface/10 italic text-[11px] font-light text-on-surface/30 leading-relaxed font-serif tracking-wide border-l-accent/40 border-l-2">
                "{prediction.insight}"
              </div>
            </div>
          </motion.div>

          <div className="glass-panel p-8 space-y-6 bg-on-surface/[0.01] shadow-sm">
            <h4 className="text-[9px] font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldCheck size={14} />
              Ethical Protocol
            </h4>
            <div className="aspect-video bg-on-surface/10 rounded-none overflow-hidden relative border border-on-surface/5 group">
              <img 
                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=400&auto=format&fit=crop" 
                alt="Medical protocol"
                className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-1000 grayscale"
              />
            </div>
            <p className="text-[9px] font-light text-on-surface/20 leading-relaxed uppercase tracking-[0.2em] text-center italic">
              Verification of instrument output is mandatory prior to archival commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
