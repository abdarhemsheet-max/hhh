import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Briefcase,
  Tag,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { DataService } from '../services/dataService';
import { useFirebase } from '../contexts/FirebaseContext';
import { DebtType, DebtStatus, TransactionType, Transaction } from '../types';
import { CATEGORY_LABELS } from '../constants';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const demoData = [
  { name: 'يناير', income: 4000, expense: 2400 },
  { name: 'فبراير', income: 3000, expense: 1398 },
  { name: 'مارس', income: 2000, expense: 9800 },
  { name: 'أبريل', income: 2780, expense: 3908 },
  { name: 'مايو', income: 1890, expense: 4800 },
];

export function Dashboard() {
  const { user } = useFirebase();
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    pendingIncome: 0
  });
  const [globalStats, setGlobalStats] = useState({
    income: 0,
    expense: 0,
    projects: 0,
    pendingIncome: 0,
    debtOwed: 0,
    debtToPay: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Monthly stats
    const unsubMonthly = DataService.subscribeMonthlyStats(user.uid, (data) => {
      setMonthlyStats(data);
    });

    // Global stats
    const unsubGlobal = DataService.subscribeGlobalStats(user.uid, (data) => {
      setGlobalStats(prev => ({ ...prev, ...data }));
    });

    // Recent Transactions
    const unsubRecent = DataService.subscribeTransactions(user.uid, TransactionType.INCOME, (items) => {
      setRecentTransactions(prev => [...items, ...prev.filter(i => i.type === TransactionType.EXPENSE)].slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    const unsubRecentExp = DataService.subscribeTransactions(user.uid, TransactionType.EXPENSE, (items) => {
      setRecentTransactions(prev => [...items, ...prev.filter(i => i.type === TransactionType.INCOME)].slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    // Debts (shared or global)
    const unsubscribeDebts = DataService.subscribeDebts(user.uid, (items) => {
      const owed = items.filter(d => d.type === DebtType.OWED_TO_ME && d.status === DebtStatus.ACTIVE).reduce((s, d) => s + d.amount, 0);
      const toPay = items.filter(d => d.type === DebtType.I_OWE && d.status === DebtStatus.ACTIVE).reduce((s, d) => s + d.amount, 0);
      setGlobalStats(prev => ({ ...prev, debtOwed: owed, debtToPay: toPay }));
    });

    // Expense Categories
    const unsubExpenses = DataService.subscribeMonthlyExpenses(user.uid, (totals) => {
      const total = Object.values(totals).reduce((sum: number, val: number) => sum + val, 0);
      const stats = Object.entries(totals).map(([cat, val]) => ({
        label: CATEGORY_LABELS[cat] || cat,
        percent: total > 0 ? Math.round((val / total) * 100) : 0,
        color: getRandomColor(cat)
      })).sort((a, b) => b.percent - a.percent);
      setCategoryStats(stats);
    });

    return () => {
      unsubMonthly();
      unsubGlobal();
      unsubscribeDebts();
      unsubExpenses();
      unsubRecent();
      unsubRecentExp();
    };
  }, [user]);

  function getRandomColor(seed: string) {
    const colors = ['bg-brand-emerald', 'bg-cyan-500', 'bg-brand-gold', 'bg-purple-500', 'bg-rose-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  const globalBalance = globalStats.income - globalStats.expense;
  const monthlyBalance = monthlyStats.income - monthlyStats.expense;

  return (
    <div className="space-y-12 pb-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[10px] font-black rounded-full border border-brand-emerald/20 uppercase tracking-widest">تحليلات ذكية</span>
        </div>
        <h2 className="text-4xl font-black text-white leading-none tracking-tight italic">أهلاً بك، {user?.displayName?.split(' ')[0] || 'عبد الرحيم'} 👋</h2>
        <p className="text-slate-500 font-bold tracking-wide uppercase text-xs">ملخص شامل لنشاطك المالي والنمو المستهدف</p>
      </header>

      {/* Stats - Monthly Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-brand-emerald rounded-full shadow-lg shadow-brand-emerald/50" />
          <h3 className="text-2xl font-black text-white tracking-tight italic">تتبع الشهر الحالي</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="دخل الشهر" 
            value={monthlyStats.income} 
            icon={TrendingUp}
            color="emerald"
            secondaryValue={globalStats.income}
            secondaryLabel="الإجمالي العام"
          />
          <StatCard 
            title="مصاريف الشهر" 
            value={monthlyStats.expense} 
            icon={TrendingDown}
            color="red"
            secondaryValue={globalStats.expense}
            secondaryLabel="الإجمالي العام"
          />
          <StatCard 
            title="فائض الشهر" 
            value={monthlyBalance} 
            icon={DollarSign}
            color="turquoise"
            secondaryValue={globalBalance}
            secondaryLabel="الرصيد الكلي"
          />
        </div>
      </section>

      {/* Stats - Global & Projects Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-brand-gold rounded-full shadow-lg shadow-brand-gold/50" />
          <h3 className="text-2xl font-black text-white tracking-tight italic">المشاريع والديون</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            title="أرباح المشاريع" 
            value={globalStats.projects} 
            icon={Briefcase}
            color="gold"
          />
          <StatCard 
            title="لي عند الناس" 
            value={globalStats.debtOwed} 
            icon={ArrowUpRight}
            color="emerald"
          />
          <StatCard 
            title="عليّ للناس" 
            value={globalStats.debtToPay} 
            icon={ArrowDownRight}
            color="red"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass p-10 rounded-[3rem] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight italic">تحليل التدفق</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">المحاكاة التحليلية بناءً على نشاطك</p>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2 bg-brand-emerald/5 px-3 py-1.5 rounded-full border border-brand-emerald/10">
                <span className="w-2 h-2 bg-brand-emerald rounded-full" />
                <span className="text-brand-emerald">الدخل</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/5 px-3 py-1.5 rounded-full border border-rose-500/10">
                <span className="w-2 h-2 bg-rose-500 rounded-full" />
                <span className="text-rose-400">المصروفات</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full relative z-10 translate-x-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demoData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.03} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ color: '#fff', marginBottom: '8px', fontWeight: '900' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 8, 16, 0.9)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    textAlign: 'right',
                    direction: 'rtl'
                  }} 
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="glass p-10 rounded-[3rem] relative overflow-hidden group">
          <h3 className="text-2xl font-black mb-8 text-white tracking-tight italic relative z-10">آخر العمليات</h3>
          <div className="space-y-6 relative z-10">
            {recentTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-600 font-bold text-sm">ابدأ بإضافة أول عملية لك</div>
            ) : (
              recentTransactions.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-lg",
                      item.type === TransactionType.INCOME ? "bg-brand-emerald/10 text-brand-emerald" : "bg-rose-500/10 text-rose-400"
                    )}>
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white tracking-tight leading-none mb-1">{CATEGORY_LABELS[item.category] || item.category}</h4>
                      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{format(new Date(item.date), 'dd MMM', { locale: ar })}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm font-black tracking-tighter italic",
                    item.type === TransactionType.INCOME ? "text-brand-emerald" : "text-rose-400"
                  )}>
                    {item.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(item.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 relative z-10">
             <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all">مشاهدة الكل</button>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="glass p-10 rounded-[3rem] relative overflow-hidden group">
          <h3 className="text-2xl font-black mb-10 text-white tracking-tight italic relative z-10">أين تذهب أموالك؟</h3>
          <div className="space-y-8 relative z-10">
            {categoryStats.length === 0 ? (
              <div className="py-10 text-center text-slate-500 font-bold text-sm">لا توجد مصاريف مسجلة هذا الشهر</div>
            ) : (
              categoryStats.map((stat, i) => (
                <CategoryRow key={i} label={stat.label} percent={stat.percent} color={stat.color} />
              ))
            )}
          </div>
          <div className="mt-12 p-6 bg-white/5 rounded-[2rem] border border-white/5 relative z-10 group-hover:bg-brand-emerald/5 transition-all duration-500">
            <p className="text-xs text-slate-400 leading-relaxed font-bold tracking-tight">
              💡 <span className="text-brand-emerald">نصيحة ذكية:</span> {categoryStats.length > 0 
                ? `أكبر مصروفاتك تتركز في ${categoryStats[0].label}. حاول خفضها لزيادة فائضك.` 
                : "ابدأ بتسجيل مصاريفك للحصول على نصائح مالية مخصصة."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, positive, icon: Icon, color, secondaryValue, secondaryLabel }: any) {
  const colors: any = {
    emerald: "bg-brand-emerald shadow-brand-emerald/40",
    red: "bg-rose-500 shadow-rose-500/40",
    turquoise: "bg-cyan-500 shadow-cyan-500/40",
    gold: "bg-brand-gold shadow-brand-gold/40",
  };

  const accentColors: any = {
    emerald: "text-brand-emerald",
    red: "text-rose-400",
    turquoise: "text-cyan-400",
    gold: "text-brand-gold",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass p-8 rounded-[2.5rem] relative group border border-white/10"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl bg-white/5 border border-white/5 transition-transform group-hover:scale-110 duration-500", accentColors[color])}>
          <Icon size={28} />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-black px-3 py-1.5 rounded-full border",
            positive ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h4 className="text-slate-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">{title}</h4>
        <p className="text-3xl font-black text-white tracking-tighter leading-none">{formatCurrency(value)}</p>
        
        {secondaryValue !== undefined && (
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{secondaryLabel}</span>
            <span className="text-xs font-black text-slate-300">{formatCurrency(secondaryValue)}</span>
          </div>
        )}
      </div>
      
      {/* Dynamic background element */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700",
        colors[color].split(' ')[0]
      )} />
    </motion.div>
  );
}

function CategoryRow({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-bold">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{formatNumber(percent)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)} 
        />
      </div>
    </div>
  );
}
