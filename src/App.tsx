/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FinanceList } from './components/FinanceList';
import { Projects } from './components/Projects';
import { Budget } from './components/Budget';
import { Debts } from './components/Debts';
import { Login } from './components/Login';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { TransactionType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu,
  Wallet,
  LayoutDashboard,
  CreditCard,
  X
} from 'lucide-react';
import { cn } from './lib/utils';

function AppContent() {
  const { user, loading, logout } = useFirebase();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/5 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-main flex text-slate-200 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-emerald/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-brand-turquoise/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-[60] backdrop-blur-md"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 right-0 w-80 bg-slate-900/90 backdrop-blur-3xl z-[70] shadow-2xl border-l border-white/10"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-emerald rounded-xl flex items-center justify-center text-bg-main shadow-lg shadow-brand-emerald/30">
                    <Wallet size={24} />
                  </div>
                  <h1 className="text-xl font-black text-white italic tracking-tighter">ميزانيتي</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide">
                <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-slate-900/40 border-b border-white/5 z-40 px-4 flex items-center justify-between backdrop-blur-2xl">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-emerald rounded-lg flex items-center justify-center text-bg-main shadow-lg shadow-brand-emerald/20">
            <Wallet size={18} />
          </div>
          <span className="font-black text-white italic tracking-tighter">ميزانيتي</span>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-emerald/40 shadow-lg">
          <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <main className="flex-1 lg:mr-72 pt-24 lg:pt-12 px-6 lg:px-12 max-w-6xl pb-32 lg:pb-12 h-screen overflow-y-auto scrollbar-hide relative z-10 transition-all duration-500">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'income' && <FinanceList type={TransactionType.INCOME} />}
            {activeTab === 'expenses' && <FinanceList type={TransactionType.EXPENSE} />}
            {activeTab === 'projects' && <Projects />}
            {activeTab === 'budget' && <Budget />}
            {activeTab === 'debts' && <Debts />}
            
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <header>
                  <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">الإعدادات</h2>
                  <p className="text-slate-500 font-bold text-xs mt-2 uppercase tracking-widest">إدارة الحساب والبيانات والربط السحابي</p>
                </header>
                
                <div className="glass p-8 lg:p-12 rounded-[3rem] space-y-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                      <img src={user.photoURL || ''} alt="" className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl transition-transform group-hover:scale-105 duration-500" />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-emerald rounded-full border-4 border-bg-main flex items-center justify-center shadow-lg">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <h3 className="text-4xl font-black text-white tracking-tighter italic">{user.displayName}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                      <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center">
                        <Wallet size={24} />
                      </div>
                      <h4 className="text-lg font-black text-white italic">تخزين البيانات</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-bold">
                        بياناتك مشفرة ومخزنة في سحابة جوجل (Firebase) ومرتبطة حصرياً بحسابك الشخصي. لا يمكن لأي شخص آخر الوصول إليها.
                      </p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-4">
                      <div className="w-12 h-12 bg-brand-turquoise/10 text-brand-turquoise rounded-2xl flex items-center justify-center">
                        <LayoutDashboard size={24} />
                      </div>
                      <h4 className="text-lg font-black text-white italic">حالة المزامنة</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-bold">
                        النظام يعمل بمزامنة لحظية. أي تغيير تقوم به سيظهر فوراً على جميع أجهزتك المتصلة بنفس الحساب.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={() => logout()}
                      className="group flex items-center gap-4 px-10 py-5 bg-rose-500/10 text-rose-400 font-black rounded-[2rem] hover:bg-rose-500/20 transition-all border border-rose-500/10 uppercase tracking-[0.2em] scale-100 active:scale-95 text-xs"
                    >
                      <span>تسجيل الخروج من النظام</span>
                      <X size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 h-20 glass rounded-[2.5rem] z-40 px-2 flex items-center justify-around pb-1 shadow-2xl backdrop-blur-3xl overflow-hidden border border-white/20">
        <MobileNavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={() => <LayoutDashboard size={22} />} 
          label="الرئيسية" 
        />
        <MobileNavItem 
          active={activeTab === 'income'} 
          onClick={() => setActiveTab('income')} 
          icon={() => (
            <div className={cn(
              "p-1 px-3 rounded-full font-bold text-[10px] border transition-all",
              activeTab === 'income' ? "bg-brand-emerald/20 text-brand-emerald border-brand-emerald/10" : "bg-white/5 text-slate-500 border-white/5"
            )}>
              +دخل
            </div>
          )}
          label="الدخل" 
        />
        <MobileNavItem 
          active={activeTab === 'expenses'} 
          onClick={() => setActiveTab('expenses')} 
          icon={() => (
            <div className={cn(
              "p-1 px-3 rounded-full font-bold text-[10px] border transition-all",
              activeTab === 'expenses' ? "bg-rose-500/20 text-rose-400 border-rose-500/10" : "bg-white/5 text-slate-500 border-white/5"
            )}>
              -صرف
            </div>
          )}
          label="المصاريف" 
        />
        <MobileNavItem 
          active={activeTab === 'debts'} 
          onClick={() => setActiveTab('debts')} 
          icon={() => (
            <div className={cn(
              "p-1 px-3 rounded-full font-bold text-[10px] border transition-all",
              activeTab === 'debts' ? "bg-slate-700/20 text-slate-300 border-white/10" : "bg-white/5 text-slate-500 border-white/5"
            )}>
              💸
            </div>
          )}
          label="الديون" 
        />
        <MobileNavItem 
          active={activeTab === 'projects'} 
          onClick={() => setActiveTab('projects')} 
          icon={() => (
            <div className={cn(
              "p-1 px-3 rounded-full font-bold text-[10px] border transition-all",
              activeTab === 'projects' ? "bg-brand-gold/20 text-brand-gold border-brand-gold/10" : "bg-white/5 text-slate-500 border-white/5"
            )}>
              🚀
            </div>
          )}
          label="المشاريع" 
        />
        <MobileNavItem 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={() => (
            <div className={cn(
              "w-8 h-8 rounded-full overflow-hidden border-2 transition-all",
              activeTab === 'settings' ? "border-brand-emerald" : "border-slate-800"
            )}>
               <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          label="حسابي" 
        />
      </nav>
    </div>
  );
}

function MobileNavItem({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-colors",
        active ? "text-emerald-700" : "text-slate-400"
      )}
    >
      <div className="h-8 flex items-center justify-center">
        <Icon />
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}


