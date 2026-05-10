import { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { useFirebase } from '../contexts/FirebaseContext';
import { ProjectStatus, Project } from '../types';
import { Plus, Briefcase, Calendar, User, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export function Projects() {
  const { user } = useFirebase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = DataService.subscribeProjects(user.uid, (items) => {
      setProjects(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleStatus = async (id: string, currentStatus: ProjectStatus) => {
    const nextStatus = currentStatus === ProjectStatus.PAID ? ProjectStatus.PENDING : ProjectStatus.PAID;
    await DataService.updateProject(id, { status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف المشروع؟')) return;
    await DataService.deleteProject(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">المشاريع والأعمال</h2>
          <p className="text-slate-500 font-medium">إدارة أعمالك الحرة والمونتاج والتصميم</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-bg-main font-bold rounded-2xl shadow-xl shadow-brand-gold/10 active:scale-95 border border-white/10">
          <Plus size={20} />
          <span className="text-sm">مشروع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-[3rem] space-y-8 group relative overflow-hidden transition-all duration-500"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-white/5 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/5">
                      {project.type}
                    </span>
                    {project.status === 'pending' && <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-ping" />}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tighter italic leading-none">{project.clientName}</h3>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border transition-all duration-500 backdrop-blur-xl shadow-lg",
                  project.status === 'paid' 
                    ? "bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 shadow-brand-emerald/10" 
                    : "bg-brand-gold/10 text-brand-gold border-brand-gold/20 shadow-brand-gold/10"
                )}>
                  {project.status === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  {project.status === 'paid' ? 'تم الدفع' : 'قيد التنفيذ'}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 relative z-10">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
                  <Calendar size={14} className="text-slate-600" />
                  <span>التسليم: {format(new Date(project.deliveryDate), 'dd MMM yyyy', { locale: ar })}</span>
                </div>
                <div className="text-2xl font-black text-white italic tracking-tighter">
                  {formatCurrency(project.amount)}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5 relative z-10">
                <button 
                  onClick={() => toggleStatus(project.id, project.status)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-xs font-black transition-all border scale-100 active:scale-95 uppercase tracking-widest",
                    project.status === 'paid' 
                      ? "bg-white/5 text-slate-500 border-white/5 hover:text-slate-300" 
                      : "bg-brand-emerald text-bg-main border-white/10 shadow-lg shadow-brand-emerald/20"
                  )}
                >
                  {project.status === 'paid' ? 'تغيير للقيد' : 'تعليم كـ مدفوع'}
                </button>
                <button 
                  onClick={() => handleDelete(project.id)} 
                  className="p-4 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/10 active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Decorative background orb */}
              <div className={cn(
                "absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700",
                project.status === 'paid' ? "bg-brand-emerald" : "bg-brand-gold"
              )} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showForm && (
        <ProjectForm user={user} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function ProjectForm({ user, onClose }: any) {
  const [formData, setFormData] = useState({ clientName: '', type: 'تصميم', amount: '', deliveryDate: format(new Date(), 'yyyy-MM-dd') });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await DataService.addProject(user.uid, {
      ...formData,
      amount: Number(formData.amount),
      status: ProjectStatus.PENDING,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-bg-main/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-card rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl border border-white/5 shadow-brand-emerald/5"
      >
        <h3 className="text-2xl font-black text-white">إضافة مشروع جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">اسم العميل</label>
            <input 
              required 
              placeholder="مثال: شركة الوفاء" 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 placeholder:text-slate-700 focus:border-brand-emerald/30 transition-all font-medium" 
              value={formData.clientName} 
              onChange={(e) => setFormData({...formData, clientName: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">النوع</label>
              <select 
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 focus:border-brand-emerald/30 transition-all font-medium appearance-none" 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option className="bg-bg-card">تصميم</option>
                <option className="bg-bg-card">مونتاج</option>
                <option className="bg-bg-card">تصوير</option>
                <option className="bg-bg-card">أخرى</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">المبلغ</label>
              <input 
                required 
                type="number" 
                placeholder="0.00" 
                className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 placeholder:text-slate-700 focus:border-brand-emerald/30 transition-all font-medium" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">تاريخ التسليم</label>
            <input 
              type="date" 
              className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none text-slate-200 focus:border-brand-emerald/30 transition-all font-medium" 
              value={formData.deliveryDate} 
              onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} 
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-brand-emerald text-bg-main font-bold rounded-2xl border border-white/10 shadow-lg shadow-brand-emerald/20 transition-all hover:brightness-110 active:scale-[0.98]">إضافة المشروع</button>
            <button type="button" onClick={onClose} className="px-6 py-4 bg-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all">إلغاء</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
