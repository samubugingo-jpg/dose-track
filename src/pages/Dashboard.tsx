import { TrendingUp, AlertTriangle, Activity, CheckCircle2, Search, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const path = 'doseRecords';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
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

  const totalStudies = records.length;
  const drlAlerts = records.filter(r => r.drlExceeded).length;
  const meanDlp = records.length > 0 
    ? (records.reduce((acc, r) => acc + (r.dlp || 0), 0) / records.length).toFixed(1)
    : '0';

  const stats = [
    { label: 'Total Studies', value: totalStudies.toString(), subtext: 'Personal Archives', icon: Activity },
    { label: 'Mean DLP', value: meanDlp, subtext: 'Current Metric', icon: TrendingUp },
    { label: 'DRL Alerts', value: drlAlerts.toString(), subtext: 'Attention Req.', icon: AlertTriangle, alert: drlAlerts > 0 },
    { label: 'Active Standards', value: '48', subtext: 'MoH Compliance', icon: CheckCircle2 },
  ];

  const chartData = {
    labels: records.slice(0, 10).reverse().map(r => r.patientId),
    datasets: [
      {
        label: 'DLP Values',
        data: records.slice(0, 10).reverse().map(r => r.dlp),
        backgroundColor: (context: any) => {
          const index = context.dataIndex;
          const record = records.slice(0, 10).reverse()[index];
          return record?.drlExceeded ? '#E11D48' : '#0EA5E9';
        },
        borderRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0C4A6E',
        titleFont: { family: 'Georgia', size: 10 },
        bodyFont: { size: 10 },
        callbacks: {
          label: (context: any) => `Value: ${context.parsed.y} mGy·cm`
        }
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(12, 74, 110, 0.05)' },
        ticks: { color: 'rgba(12, 74, 110, 0.4)', font: { size: 9 } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(12, 74, 110, 0.4)', font: { size: 9 } }
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 max-w-7xl mx-auto"
    >
      {/* Alert Banner */}
      <AnimatePresence mode="wait">
        {drlAlerts > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel bg-error/5 text-on-surface p-6 flex items-center justify-between border-l-4 border-l-error relative overflow-hidden"
          >
            <motion.div 
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-error/5"
            />
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <AlertTriangle className="text-error" size={24} />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                </span>
              </div>
              <div>
                <h3 className="serif-title text-xl font-light italic">Critical Observations</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mt-1">{drlAlerts} records exceed Rwanda National DRLs.</p>
              </div>
            </div>
            <button className="relative z-10 bg-on-surface text-surface px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all">
              Review
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={cn(
              "glass-panel p-8 flex flex-col justify-between transition-all hover:bg-white group",
              stat.alert && "border-accent/40"
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.3em]">{stat.label}</span>
              <stat.icon size={14} className={cn("transition-colors duration-500", stat.alert ? 'text-accent' : 'text-on-surface/20 group-hover:text-accent')} />
            </div>
            <div className="mt-6">
              <h3 className={cn("text-4xl serif-title italic transition-all duration-700", stat.alert ? "text-accent" : "text-on-surface/90 group-hover:tracking-wider")}>{stat.value}</h3>
              <p className="text-[9px] text-on-surface/20 uppercase tracking-widest mt-2">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-10 h-[500px] flex flex-col group">
          <div className="flex justify-between items-baseline mb-12">
            <div className="flex items-center gap-4">
              <h3 className="serif-title text-2xl italic font-light text-on-surface/90">Exposure Analytics</h3>
              <span className="flex h-1.5 w-1.5 cursor-help">
                <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
              </span>
            </div>
            <div className="flex gap-4 text-[9px] uppercase tracking-widest text-on-surface/30">
              <button className="hover:text-accent transition-colors">7D</button>
              <button className="text-accent underline underline-offset-4">30D</button>
              <button className="hover:text-accent transition-colors">1Y</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 grayscale hover:grayscale-0 transition-all duration-1000">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1 glass-panel p-10 flex flex-col justify-end relative overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop"
            alt="AI Protocol"
            className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:scale-110 transition-transform duration-[3000ms] grayscale"
          />
          <div className="relative z-10">
            <div className="mb-6">
              <span className="border border-accent/40 text-accent text-[8px] px-3 py-1 uppercase tracking-[0.3em]">AI Synthesis</span>
            </div>
            <h3 className="serif-title text-3xl font-light italic mb-4 leading-tight text-on-surface">Optimization Report</h3>
            <p className="text-[11px] text-on-surface/40 leading-relaxed font-light mb-10 tracking-wide">
              Neural analysis suggests protocol refinement for thoracic scans could decrease patient exposure by 18%.
            </p>
            <button className="w-full h-14 border border-on-surface/20 text-on-surface text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-on-surface hover:text-surface transition-all">
              Execute Refinement
            </button>
          </div>
        </motion.div>
      </div>

      {/* Aggregate Stats Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-on-surface/10 pb-4">
          <h3 className="serif-title text-2xl italic font-light text-on-surface">Comparative Markers</h3>
          <button className="text-[9px] uppercase tracking-widest text-on-surface/40 hover:text-accent transition-colors">View Protocols</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'HEAD CT', value: 940, width: '85%' },
            { label: 'CHEST CT', value: 380, width: '45%' },
            { label: 'ABDOMEN', value: 620, width: '95%', alert: true },
            { label: 'PELVIS', value: 510, width: '60%' },
            { label: 'NECK CT', value: 310, width: '35%' },
            { label: 'LUNG CA', value: 280, width: '25%' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 hover:bg-white transition-colors shadow-sm">
              <span className="text-[8px] font-medium text-on-surface/30 block mb-2 uppercase tracking-[0.3em]">{stat.label}</span>
              <div className="text-on-surface text-lg font-serif italic">
                {stat.value} <span className="text-[9px] text-on-surface/20 uppercase tracking-widest not-italic font-sans">mGy·cm</span>
              </div>
              <div className="w-full bg-on-surface/5 h-[1px] mt-4 relative">
                <div 
                  className={cn("h-full absolute top-0 left-0", stat.alert ? "bg-accent" : "bg-on-surface/30")} 
                  style={{ width: stat.width }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Dose Entries Table */}
      <div className="glass-panel overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-on-surface/10 flex justify-between items-baseline">
          <h3 className="serif-title text-2xl italic font-light text-on-surface">Ledger of Entries</h3>
          <div className="flex gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface/20" size={12} />
              <input 
                placeholder="REGISTRY SEARCH" 
                className="bg-transparent border-none pl-6 py-1 text-[9px] uppercase tracking-widest text-on-surface placeholder:text-on-surface/20 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-on-surface/[0.03] text-on-surface/40 uppercase tracking-[0.2em] text-[8px]">
              <tr>
                <th className="px-10 py-5 font-medium">Identifier</th>
                <th className="px-10 py-5 font-medium">Classification</th>
                <th className="px-10 py-5 font-medium">Index</th>
                <th className="px-10 py-5 font-medium">Product</th>
                <th className="px-10 py-5 font-medium">Temporal Marker</th>
                <th className="px-10 py-5 font-medium">Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/5 text-[11px]">
              {records.slice(0, 5).map((row, i) => (
                <tr key={i} className="hover:bg-on-surface/[0.01] transition-colors group">
                  <td className="px-10 py-6 text-accent font-medium tracking-wider">{row.patientId}</td>
                  <td className="px-10 py-6 text-on-surface/60 uppercase tracking-widest text-[9px]">{row.examType}</td>
                  <td className={cn("px-10 py-6", row.drlExceeded && "text-accent font-bold")}>{row.ctdiVol}</td>
                  <td className={cn("px-10 py-6", row.drlExceeded && "text-accent font-bold")}>{row.dlp}</td>
                  <td className="px-10 py-6 text-on-surface/30 font-light">{row.examDate}</td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-3 py-1 border text-[8px] uppercase tracking-widest",
                      row.drlExceeded ? "border-accent/40 text-accent font-bold" : "border-on-surface/10 text-on-surface/40"
                    )}>
                      {row.drlExceeded ? 'Exceeds' : 'Standard'}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center text-on-surface/10 serif-title italic text-lg">
                    The archives are currently empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
