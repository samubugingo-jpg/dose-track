import { Search, Bell, HelpCircle, Settings } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-24 bg-surface/80 backdrop-blur-md text-on-surface px-12 flex items-center justify-between z-50 border-b border-on-surface/5 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl serif-title italic letter-spacing-widest font-light text-on-surface/90">DOSETRACK</h1>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-accent transition-colors" size={16} />
          <input
            type="text"
            placeholder="PATIENT ID SEARCH"
            className="bg-on-surface/5 border border-on-surface/10 rounded-none py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface/20 focus:outline-none focus:border-accent/40 w-64 text-[10px] uppercase tracking-widest transition-all"
          />
        </div>

        <div className="flex items-center gap-6">
          <button className="p-2 text-on-surface/40 hover:text-accent transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1 h-1 bg-accent rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-4 ml-2 border-l border-on-surface/10 pl-6">
            <div className="text-right hidden lg:block">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-on-surface">{user?.displayName || 'Medical Staff'}</p>
              <p className="text-[9px] text-accent italic serif-title tracking-widest mt-1">Clinical Lead</p>
            </div>
            <div className="h-10 w-10 rounded-none border border-on-surface/10 p-[2px] overflow-hidden hover:grayscale-0 transition-all duration-500">
              <img
                src={user?.photoURL || "https://plus.unsplash.com/premium_photo-1661633190833-2ca735e5898d?q=80&w=200&auto=format&fit=crop"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
