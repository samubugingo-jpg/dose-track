import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop" 
          alt="Medical Background" 
          className="w-full h-full object-cover opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg glass-panel p-16 space-y-12 text-center bg-surface/40 shadow-xl"
        >
          <div className="space-y-4">
            <h1 className="text-4xl serif-title italic letter-spacing-widest text-accent font-light">DOSETRACK</h1>
            <p className="text-[10px] uppercase tracking-[0.5em] text-on-surface/30">Rwanda National Dosimetry Registry</p>
          </div>

          <div className="w-16 h-[1px] bg-on-surface/10 mx-auto"></div>

          <div className="space-y-8">
            <h2 className="text-2xl serif-title italic text-on-surface/90 font-light">Secure Access <br/>Verification</h2>
            <p className="text-[11px] text-on-surface/30 leading-relaxed font-light uppercase tracking-widest px-8">
              Clinical credentials required for medical registry access and dosimetry analytics.
            </p>
          </div>

          <button
            onClick={login}
            className="w-full h-16 bg-on-surface text-surface font-bold text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-accent hover:text-white transition-all shadow-sm active:scale-[0.98] group"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-surface/10 group-hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            Sign in with Google
          </button>

          <p className="text-[9px] uppercase tracking-[0.2em] text-on-surface/10 font-medium">
            Authorized Personnel Only • HIPAA Compliant Infrastructure
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center z-10 opacity-30">
        <p className="text-[8px] uppercase tracking-[0.4em] text-on-background">Clinical Node 04-22</p>
        <p className="text-[8px] uppercase tracking-[0.4em] text-on-background">System v4.8 Alpha</p>
      </div>
    </div>
  );
}
