import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TransactionType, IncomeSource, ExpenseCategory } from '../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const schema = z.object({
  amount: z.preprocess((val) => Number(val), z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر')),
  category: z.string().min(1, 'يرجى اختيار التصنيف'),
  date: z.string().min(1, 'يرجى اختيار التاريخ'),
  notes: z.string().optional(),
  isPending: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function TransactionForm({ type, onSubmit, onClose }: TransactionFormProps) {
  const categories = type === TransactionType.INCOME 
    ? Object.entries(IncomeSource).map(([label, value]) => ({ label, value }))
    : Object.entries(ExpenseCategory).map(([label, value]) => ({ label, value }));

  const categoryLabels: Record<string, string> = {
    [IncomeSource.SALARY]: 'المرتب شهري',
    [IncomeSource.PARENTAL]: 'دعم الوالد',
    [IncomeSource.DESIGN]: 'أعمال تصميم',
    [IncomeSource.MONTAGE]: 'أعمال مونتاج',
    [IncomeSource.COMPETITION]: 'أرباح مسابقات',
    [IncomeSource.FREELANCE]: 'أعمال حرة',
    [IncomeSource.GIFT]: 'هدايا',
    [IncomeSource.OTHER]: 'أخرى',
    [ExpenseCategory.FOOD]: 'طعام وشراب',
    [ExpenseCategory.TRANSPORT]: 'مواصلات',
    [ExpenseCategory.INTERNET]: 'إنترنت واتصالات',
    [ExpenseCategory.EQUIPMENT]: 'معدات',
    [ExpenseCategory.SOFTWARE]: 'برامج واشتراكات',
    [ExpenseCategory.CLOTHING]: 'ملابس',
    [ExpenseCategory.STUDY]: 'دراسة',
    [ExpenseCategory.ENTERTAINMENT]: 'ترفيه',
    [ExpenseCategory.CHARITY]: 'صدقات',
    [ExpenseCategory.PERSONAL]: 'مصروف شخصي',
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  return (
    <div className="fixed inset-0 bg-bg-main/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/10"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-2xl font-black text-white italic tracking-tight">
            {type === TransactionType.INCOME ? 'إضافة دخل جديد' : 'إضافة مصروف جديد'}
          </h3>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all text-slate-500 active:scale-90">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-2">المبلغ</label>
            <input 
              {...register('amount')}
              type="number"
              step="0.01"
              className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl focus:border-white/20 outline-none transition-all text-slate-200 font-bold placeholder:text-slate-700 text-xl italic"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-rose-400 text-[10px] mt-1 pr-4 font-bold">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-2">التصنيف</label>
              <div className="relative">
                <select 
                  {...register('category')}
                  className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl focus:border-white/20 outline-none transition-all text-slate-200 font-bold appearance-none italic"
                >
                  <option value="" className="bg-slate-900">اختر</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-slate-900 font-sans">
                      {categoryLabels[cat.value] || cat.value}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="text-rose-400 text-[10px] mt-1 pr-4 font-bold">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-2">التاريخ</label>
              <input 
                {...register('date')}
                type="date"
                className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl focus:border-white/20 outline-none transition-all text-slate-200 font-bold italic"
              />
              {errors.date && <p className="text-rose-400 text-[10px] mt-1 pr-4 font-bold">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-2">ملاحظات (اختياري)</label>
            <textarea 
              {...register('notes')}
              className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl focus:border-white/20 outline-none transition-all h-28 resize-none text-slate-200 placeholder:text-slate-700 font-bold placeholder:font-normal italic"
              placeholder="اكتب ملاحظاتك هنا..."
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border",
                type === TransactionType.INCOME ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              )}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                    ⏳
                  </motion.span>
                </motion.div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-200 tracking-tight">عملية معلقة؟</p>
                <p className="text-[10px] text-slate-500 font-medium">لن تؤثر على الرصيد حالياً</p>
              </div>
            </div>
            <input 
              type="checkbox" 
              {...register('isPending')}
              className="w-7 h-7 rounded-lg bg-bg-main border-white/10 text-brand-emerald focus:ring-brand-emerald checked:bg-brand-emerald transition-all"
            />
          </div>

          <button 
            type="submit"
            className={cn(
              "w-full py-5 text-bg-main font-black rounded-3xl border border-white/10 shadow-2xl transition-all scale-100 active:scale-95 mt-6 text-lg uppercase tracking-widest italic",
              type === TransactionType.INCOME 
                ? "bg-brand-emerald shadow-brand-emerald/20 shadow-[0_20px_50px_rgba(16,185,129,0.2)]" 
                : "bg-rose-500 shadow-rose-500/20 shadow-[0_20px_50px_rgba(244,63,94,0.2)]"
            )}
          >
            تأكيد العملية
          </button>
        </form>
      </motion.div>
    </div>
  );
}
