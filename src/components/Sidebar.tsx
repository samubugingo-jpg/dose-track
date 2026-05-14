import { LayoutDashboard, PlusCircle, Database, FileText, Info, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../lib/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Analytics', path: '/' },
    { icon: PlusCircle, label: 'Entry', path: '/entry' },
    { icon: Database, label: 'Records', path: '/records' },
  ];

  return (
    <aside className="fixed left-0 top-24 h-[calc(100vh-96px)] w-64 bg-surface/50 backdrop-blur-xl border-r border-on-surface/5 flex flex-col z-40">
      <div className="p-10 border-b border-on-surface/5">
        <h2 className="text-xl serif-title italic text-accent tracking-widest font-light">Clinical</h2>
        <p className="text-[9px] font-medium text-on-surface/30 uppercase tracking-[0.3em] mt-2">Hospital Resource</p>
      </div>

      <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 py-4 px-6 transition-all duration-300 text-[10px] uppercase tracking-[0.2em] group",
                isActive
                  ? "text-accent border-l-2 border-accent bg-accent/5 font-bold"
                  : "text-on-surface/40 hover:text-on-surface hover:bg-on-surface/[0.02]"
              )
            }
          >
            <item.icon size={16} className={cn("transition-colors", "group-hover:text-accent")} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-on-surface/5 flex flex-col gap-6">
        <button className="w-full h-12 bg-on-surface text-surface py-2 px-4 rounded-none font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all shadow-sm active:scale-[0.98]">
          <FileText size={16} />
          Report
        </button>
        
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-4 py-2 px-4 text-on-surface/30 hover:text-accent transition-colors text-[9px] uppercase tracking-[0.3em]">
            <Info size={16} />
            Info
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-4 py-2 px-4 text-on-surface/30 hover:text-error transition-colors text-[9px] uppercase tracking-[0.3em]"
          >
            <LogOut size={16} />
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
}
