import { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { useFirebase } from '../contexts/FirebaseContext';
import { Plus, Target, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Budget as BudgetType } from '../types';
import { CATEGORY_LABELS } from '../constants';

export function Budget() {
  const { user } = useFirebase();
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribeB = DataService.subscribeBudgets(user.uid, setBudgets);
    const unsubscribeE = DataService.subscribeMonthlyExpenses(user.uid, setExpenses);

    return () => { unsubscribeB(); unsubscribeE(); };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('حذف الميزانية؟')) return;
    await DataService.deleteBudget(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">الميزانية الشهرية</h2>
          <p className="text-slate-500 font-medium">حدد حدود الصرف لكل قسم ونبه نفسك عند التجاوز</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-bg-main font-bold rounded-2xl shadow-xl shadow-cyan-500/10 active:scale-95 border border-white/10">
          <Plus size={20} />
          <span className="text-sm">تحديد ميزانية</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {budgets.map((budget) => {
            const spent = expenses[budget.category] || 0;
            const percent = Math.min(100, (spent / budget.limit) * 100);
            const isDanger = percent >= 90;

            return (
              <motion.div
                key={budget.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="glass p-8 rounded-[3rem] space-y-8 relative overflow-hidden group transition-all duration-500"
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="p-4 bg-cyan-500/10 rounded-[1.5rem] text-cyan-400 border border-cyan-500/20 backdrop-blur-xl shadow-lg shadow-cyan-500/10">
                    <Target size={28} />
                  </div>
                  <button onClick={() => handleDelete(budget.id)} className="p-3 text-slate-600 hover:text-rose-400 transition-all active:scale-90">
                    <Trash2 size={22} />
                  </button>
                </div>

                <div className="space-y-3 relative z-10">
                  <h3 className="text-2xl font-black text-white tracking-tight italic leading-none">{CATEGORY_LABELS[budget.category] || budget.category}</h3>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                    <span className="text-slate-500">تم صرف <span className="text-white ml-1">{formatCurrency(spent)}</span></span>
                    <span className="text-slate-500">من <span className="text-slate-300 ml-1">{formatCurrency(budget.limit)}</span></span>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-lg",
                        percent >= 100 ? "bg-rose-500 shadow-rose-500/30" : isDanger ? "bg-brand-gold shadow-brand-gold/30" : "bg-cyan-500 shadow-cyan-500/30"
                      )} 
                    />
                  </div>
                  {isDanger && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl backdrop-blur-md border",
                        percent >= 100 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                      )}
                    >
                      <AlertCircle size={14} />
                      <span>{percent >= 100 ? 'تجاوزت الميزانية!' : 'اقتربت من الحد الأقصى'}</span>
                    </motion.div>
                  )}
                </div>

                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-500/5 rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-colors duration-700" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showForm && (
        <BudgetForm user={user} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function BudgetForm({ user, onClose }: any) {
  const [formData, setFormData] = useState({ category: 'food', limit: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await DataService.addBudget(user.uid, {
      ...formData,
      limit: Number(formData.limit),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-card rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl border border-white/5 shadow-cyan-500/5"
      >
        <h3 className="text-2xl font-black text-white">تحديد ميزانية قسم</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">القسم</label>
            <select 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 focus:border-cyan-500/30 transition-all font-medium appearance-none" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="bg-bg-card">{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">الحد الأقصى شهرياً</label>
            <input 
              required 
              type="number" 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 placeholder:text-slate-700 focus:border-cyan-500/30 transition-all font-medium" 
              placeholder="0.00" 
              value={formData.limit} 
              onChange={(e) => setFormData({...formData, limit: e.target.value})} 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-cyan-500 text-bg-main font-bold rounded-2xl border border-white/10 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-[0.98]">حفظ الميزانية</button>
            <button type="button" onClick={onClose} className="px-6 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
