import { Wallet } from 'lucide-react';
import { signInWithGoogle } from '../services/firebase';
import { motion } from 'motion/react';

export function Login() {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-emerald/20 rounded-full blur-[140px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
          rotate: [0, -45, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full glass rounded-[4rem] p-16 shadow-2xl border border-white/10 text-center space-y-12 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-28 h-28 bg-brand-emerald rounded-[2.5rem] flex items-center justify-center text-bg-main shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative group cursor-pointer transition-all duration-500"
        >
          <Wallet size={56} className="group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -inset-4 bg-brand-emerald/20 rounded-[3rem] blur-2xl -z-10 group-hover:bg-brand-emerald/30 transition-colors" />
        </motion.div>
        
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-black text-white tracking-tighter italic"
          >
            ميزانيتي<span className="text-brand-emerald">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-slate-400 font-bold leading-relaxed text-sm tracking-tight px-4"
          >
            نظام مالي احترافي يدير دخلك ومصاريفك بذكاء وواجهة زجاجية عصرية تحاكي أسلوب الـ <span className="text-white italic">iPhonestyling</span>
          </motion.p>
        </div>

        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          onClick={() => signInWithGoogle()}
          className="group w-full flex items-center justify-center gap-5 py-5 px-8 glass border border-white/10 rounded-[2rem] text-white font-black text-lg hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
          <span className="italic">الدخول بواسطة جوجل</span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="pt-4"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-emerald/40 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse delay-150" />
            <span className="w-2 h-2 rounded-full bg-rose-500/40 animate-pulse delay-300" />
          </div>
          <p className="mt-6 text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Smart • Secure • Elegant</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
