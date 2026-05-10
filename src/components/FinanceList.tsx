import { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { useFirebase } from '../contexts/FirebaseContext';
import { TransactionType, Transaction, TransactionStatus } from '../types';
import { TransactionForm } from './TransactionForm';
import { Plus, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { CATEGORY_LABELS } from '../constants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function FinanceList({ type }: { type: TransactionType }) {
  const { user } = useFirebase();
  const [data, setData] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const title = type === TransactionType.INCOME ? 'الدخل' : 'المصروفات';

  useEffect(() => {
    if (!user) return;

    const unsubscribe = DataService.subscribeTransactions(user.uid, type, (items) => {
      setData(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, type]);

  const handleSubmit = async (formData: any) => {
    if (!user) return;
    const { isPending, ...rest } = formData;
    await DataService.addTransaction(user.uid, {
      ...rest,
      status: isPending ? TransactionStatus.PENDING : TransactionStatus.COMPLETED,
      type
    });
    setShowForm(false);
  };

  const toggleStatus = async (id: string, currentStatus: TransactionStatus) => {
    await DataService.updateTransaction(id, {
      status: currentStatus === TransactionStatus.PENDING ? TransactionStatus.COMPLETED : TransactionStatus.PENDING,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العملية؟')) return;
    await DataService.deleteTransaction(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-slate-500 font-medium tracking-wide prose-sm">لديك {formatNumber(data.length)} عملية مسجلة</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-2xl text-bg-main font-bold transition-all shadow-xl active:scale-95 border border-white/10",
            type === TransactionType.INCOME ? "bg-brand-emerald shadow-brand-emerald/20" : "bg-rose-500 shadow-rose-500/20"
          )}
        >
          <Plus size={20} />
          <span className="text-sm">إضافة {type === TransactionType.INCOME ? 'دخل' : 'مصروف'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-white/5 border-t-brand-emerald rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="glass py-24 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-6">
              <div className="p-8 bg-white/5 rounded-full backdrop-blur-xl">
                <Tag size={48} className="opacity-10" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">لا توجد عمليات مسجلة بعد</p>
            </div>
          ) : (
            data.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.06] transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 backdrop-blur-xl",
                    type === TransactionType.INCOME 
                      ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 group-hover:bg-brand-emerald/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20"
                  )}>
                    <Tag size={24} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-white text-lg tracking-tight">{CATEGORY_LABELS[item.category] || item.category}</h4>
                      {item.status === 'pending' && (
                        <span className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5">
                          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            ⏳
                          </motion.span>
                          معلق
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-600" />
                        {format(new Date(item.date), 'dd MMMM yyyy', { locale: ar })}
                      </span>
                      {item.notes && (
                        <span className="flex items-center gap-2 max-w-[200px] truncate">
                          <FileText size={12} className="text-slate-600" />
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-left rtl:text-right">
                    <p className={cn(
                      "text-2xl font-black tracking-tighter italic",
                      item.status === 'pending' ? "text-slate-600" : (type === TransactionType.INCOME ? "text-brand-emerald" : "text-rose-400")
                    )}>
                      {type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.status === 'pending' && (
                      <button 
                        onClick={() => toggleStatus(item.id, item.status)}
                        className="p-3 text-brand-emerald bg-brand-emerald/5 hover:bg-brand-emerald/10 rounded-xl transition-all border border-brand-emerald/10 active:scale-90"
                        title="تعليم كـ مكتمل"
                      >
                        ✅
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {showForm && (
        <TransactionForm 
          type={type} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleSubmit} 
        />
      )}
    </div>
  );
}
