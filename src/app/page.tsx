'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, ShieldCheck, User as UserIcon, ArrowRight, Sparkles, CheckCircle2, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { User } from '../components/shared/types';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // すでにログインしているかチェック
    const saved = localStorage.getItem('train_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user.role === 'ADMIN') router.push('/admin');
        else router.push('/dashboard');
      } catch (e) {
        localStorage.removeItem('train_user');
        console.error('Failed to parse saved user');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role) {
      setError('名前を入力し、役割を選択してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role })
      });

      if (!res.ok) throw new Error('通信エラーが発生しました');

      const user = await res.json();
      localStorage.setItem('train_user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* バックグラウンドグラデーション */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-indigo-500/20 shadow-xl"
          >
            <Train className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Trainへようこそ</h1>
          <p className="text-slate-400 text-xs font-medium tracking-wide">チームの貢献を可視化。成長を加速する。</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">お名前</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：山田 太郎"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">あなたの役割</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('MEMBER')}
                  className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                    role === 'MEMBER'
                      ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <UserIcon className={cn("w-6 h-6", role === 'MEMBER' ? "text-indigo-400" : "text-slate-500")} />
                  <span className={cn("text-xs font-black", role === 'MEMBER' ? "text-white" : "text-slate-500")}>メンバー</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={cn(
                    "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                    role === 'ADMIN'
                      ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <ShieldCheck className={cn("w-6 h-6", role === 'ADMIN' ? "text-purple-400" : "text-slate-500")} />
                  <span className={cn("text-xs font-black", role === 'ADMIN' ? "text-white" : "text-slate-500")}>管理者</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">プロジェクトに参加する</span>
                <LogIn className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Powered by Gemini AI
        </div>
      </motion.div>
    </div>
  );
}
