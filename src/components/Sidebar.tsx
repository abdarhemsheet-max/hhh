import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Target,
  Settings,
  LogOut,
  Wallet,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', id: 'dashboard' },
  { icon: ArrowUpRight, label: 'الدخل', id: 'income' },
  { icon: ArrowDownRight, label: 'المصروفات', id: 'expenses' },
  { icon: Briefcase, label: 'المشاريع', id: 'projects' },
  { icon: Target, label: 'الميزانية', id: 'budget' },
  { icon: CreditCard, label: 'الديون', id: 'debts' },
  { icon: Settings, label: 'الإعدادات', id: 'settings' },
];

export function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 w-72 backdrop-blur-3xl bg-slate-900/40 border-l border-white/10 hidden lg:flex flex-col z-50">
      <div className="p-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-emerald rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-emerald/40">
          <Wallet size={24} className="text-bg-main" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white italic leading-none">ميزانيتي</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-emerald mt-1">النسخة الاحترافية</p>
        </div>
      </div>

      <nav className="flex-1 px-6 py-4 space-y-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
              activeTab === item.id 
                ? "bg-white/10 text-white shadow-xl ring-1 ring-white/20" 
                : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <item.icon size={22} className={cn(
              "transition-all duration-300",
              activeTab === item.id ? "text-brand-emerald scale-110" : "text-slate-500 group-hover:text-slate-400"
            )} />
            <span className={cn(
              "text-sm font-black tracking-tight",
              activeTab === item.id ? "translate-x-1" : "group-hover:translate-x-1 transition-transform"
            )}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="p-4 rounded-[2rem] bg-white/5 border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-emerald/20 flex items-center justify-center">
              <LogOut size={16} className="text-brand-emerald" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">نظام آمن</span>
          </div>
          <button className="w-full py-3 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-black transition-all border border-white/5">
            خروج من النظام
          </button>
        </div>
      </div>
    </aside>
  );
}
