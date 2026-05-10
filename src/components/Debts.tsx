import { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { useFirebase } from '../contexts/FirebaseContext';
import { Debt, DebtType, DebtStatus } from '../types';
import { Plus, Trash2, Calendar, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function Debts() {
  const { user } = useFirebase();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = DataService.subscribeDebts(user.uid, (items) => {
      setDebts(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleStatus = async (id: string, currentStatus: DebtStatus) => {
    const nextStatus = currentStatus === DebtStatus.PAID ? DebtStatus.ACTIVE : DebtStatus.PAID;
    await DataService.updateDebt(id, { status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدين؟')) return;
    await DataService.deleteDebt(id);
  };

  const totalToCollect = debts
    .filter(d => d.type === DebtType.OWED_TO_ME && d.status === DebtStatus.ACTIVE)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalToPay = debts
    .filter(d => d.type === DebtType.I_OWE && d.status === DebtStatus.ACTIVE)
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">الديون والالتزامات</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">تتبع مستحقاتك والتزاماتك المالية</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-emerald text-bg-main rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-emerald/20"
        >
          <Plus size={20} />
          <span>دين جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-emerald opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity duration-700" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">لي عند الناس</p>
          <h3 className="text-4xl font-black text-brand-emerald tracking-tighter italic leading-none relative z-10">{formatCurrency(totalToCollect)}</h3>
        </div>
        <div className="glass p-8 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-rose-500 opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity duration-700" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">عليّ للناس</p>
          <h3 className="text-4xl font-black text-rose-400 tracking-tighter italic leading-none relative z-10">{formatCurrency(totalToPay)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-xs">جاري تحميل البيانات...</div>
          ) : debts.length === 0 ? (
            <div className="py-24 text-center glass rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
              <Clock size={64} className="text-slate-800 mb-6" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">لا يوجد ديون مسجلة حالياً</p>
            </div>
          ) : (
            debts.map((debt) => (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "glass p-6 rounded-[2.5rem] transition-all duration-500 group",
                  debt.status === DebtStatus.PAID ? "opacity-50 grayscale select-none" : "hover:bg-white/[0.06]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 text-right rtl:text-right">
                    <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border backdrop-blur-xl transition-all duration-500 shadow-xl",
                      debt.type === DebtType.OWED_TO_ME 
                        ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 group-hover:bg-brand-emerald/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20"
                    )}>
                      <User size={28} />
                    </div>
                    <div className="space-y-1.5 font-sans">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-black text-white text-xl tracking-tight leading-none">{debt.personName}</h4>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                          debt.type === DebtType.OWED_TO_ME
                            ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {debt.type === DebtType.OWED_TO_ME ? 'لي' : 'علي'}
                        </span>
                        {debt.status === DebtStatus.PAID && (
                          <span className="px-2.5 py-1 bg-white/5 text-slate-400 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">
                            تم السداد
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-600" />
                          {debt.dueDate ? format(new Date(debt.dueDate), 'd MMMM yyyy', { locale: ar }) : 'بدون موعد'}
                        </span>
                        {debt.notes && (
                          <p className="max-w-[200px] truncate text-slate-400">{debt.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-0 pt-6 md:pt-0">
                    <div className="text-left rtl:text-right">
                      <p className={cn(
                        "text-3xl font-black tracking-tighter italic",
                        debt.status === DebtStatus.PAID ? "text-slate-600 line-through" : (debt.type === DebtType.OWED_TO_ME ? "text-brand-emerald" : "text-rose-400")
                      )}>
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => toggleStatus(debt.id, debt.status)}
                        className={cn(
                          "p-3 rounded-2xl transition-all border backdrop-blur-xl active:scale-90 shadow-lg",
                          debt.status === DebtStatus.PAID 
                            ? "text-slate-500 border-white/5 bg-white/5 hover:bg-white/10" 
                            : "text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5 hover:bg-brand-emerald/10"
                        )}
                        title={debt.status === DebtStatus.PAID ? "إلغاء السداد" : "تحديد كمُسدد"}
                      >
                        <CheckCircle2 size={22} />
                      </button>
                      <button 
                        onClick={() => handleDelete(debt.id)}
                        className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <DebtForm 
            onClose={() => setShowForm(false)} 
            onSubmit={async (data) => {
              if (user) {
                await DataService.addDebt(user.uid, {
                  ...data,
                  status: DebtStatus.ACTIVE,
                });
                setShowForm(false);
              }
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DebtForm({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    type: DebtType.I_OWE,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg-main/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-100 italic tracking-tight">إضافة دين جديد</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Plus className="rotate-45 text-slate-500" />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, amount: Number(formData.amount) }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: DebtType.OWED_TO_ME })}
                className={cn(
                  "py-3 rounded-xl transition-all font-black text-sm uppercase tracking-widest scale-100 active:scale-95",
                  formData.type === DebtType.OWED_TO_ME 
                    ? "bg-brand-emerald text-bg-main shadow-lg shadow-brand-emerald/20" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                لي (مستحق)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: DebtType.I_OWE })}
                className={cn(
                  "py-3 rounded-xl transition-all font-black text-sm uppercase tracking-widest scale-100 active:scale-95",
                  formData.type === DebtType.I_OWE 
                    ? "bg-rose-500 text-bg-main shadow-lg shadow-rose-500/20" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                عليّ (التزام)
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">اسم الشخص / الجهة</label>
                <input 
                  type="text" 
                  required
                  placeholder="محمد، البنك، الخ..."
                  value={formData.personName}
                  onChange={e => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-200 focus:bg-white/10 focus:border-brand-emerald transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">المبلغ</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-200 focus:bg-white/10 focus:border-brand-emerald transition-all outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">تاريخ السداد المتوقع</label>
                <input 
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-200 focus:bg-white/10 focus:border-brand-emerald transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">ملاحظات إضافية</label>
                <textarea 
                  placeholder="سبب الدين، الخ..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-slate-200 focus:bg-white/10 focus:border-brand-emerald transition-all outline-none h-24 resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className={cn(
                "w-full py-4 rounded-3xl font-black text-lg shadow-xl transition-all scale-100 active:scale-95 text-bg-main mt-6",
                formData.type === DebtType.OWED_TO_ME ? "bg-brand-emerald shadow-brand-emerald/20" : "bg-rose-500 shadow-rose-500/20"
              )}
            >
              حفظ الدين
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
