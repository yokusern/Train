'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Train, User as UserIcon, Sparkles, LogIn, Loader2, Users, KeyRound, Copy, Check } from 'lucide-react';
import type { User, Team, Role } from '@/components/shared/types';
import { getStorageItem, setStorageItem } from '@/lib/storage';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const u = getStorageItem<User>('user');
    if (u) {
      setUser(u);
      if (u.currentTeamId) {
        // Simple role check for redirect (simplified, ideally re-fetch from API)
        router.push(u.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    }
    // Load recent codes from PERSISTENT storage (survives logout)
    const codes = getStorageItem<string[]>('recent_codes', true) || [];
    setRecentCodes(codes);
  }, [router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: `${name.trim().toLowerCase()}@example.com` })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStorageItem('user', data);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    const n = teamName.trim();
    if (!n || !user) {
      setError('チーム名を入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: n, userId: user.id })
      });
      const team = await res.json();
      if (team.error) throw new Error(team.error);

      // Update local user session with currentTeamId
      const updatedUser = { ...user, currentTeamId: team.id, role: team.role as Role };
      setStorageItem('user', updatedUser);
      setUser(updatedUser);

      // Save code to PERSISTENT storage
      const codes = getStorageItem<string[]>('recent_codes', true) || [];
      if (!codes.includes(team.joinCode)) {
        setStorageItem('recent_codes', [team.joinCode, ...codes].slice(0, 5), true);
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'チームの作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,6}$/.test(code) || !user) {
      setError('正しい参加コードを入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', joinCode: code, userId: user.id })
      });
      const team = await res.json();
      if (team.error) throw new Error(team.error);

      const updatedUser = { ...user, currentTeamId: team.id, role: team.role as Role };
      setStorageItem('user', updatedUser);
      setUser(updatedUser);

      // Save code to PERSISTENT storage
      const codes = getStorageItem<string[]>('recent_codes', true) || [];
      if (!codes.includes(code)) {
        setStorageItem('recent_codes', [code, ...codes].slice(0, 5), true);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'チームへの参加に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const needsTeam = !!user && !user.currentTeamId;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* バックグラウンドグラデーション */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative z-10"
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

        {!user ? (
          /* ── ステップ1: ユーザー名入力 ── */
          <form onSubmit={handleCreateUser} className="space-y-6">
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

            {error && <p className="text-xs font-bold text-rose-500 text-center">{error}</p>}

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
                  <span className="relative z-10">はじめる</span>
                  <LogIn className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        ) : needsTeam ? (
          /* ── ステップ2: チーム作成 or 参加 ── */
          <div className="space-y-6">
            <p className="text-center text-xs font-bold text-slate-400">
              ようこそ、<span className="text-white">{user?.name}</span> さん！<br />
              チームを作成するか、参加コードで既存チームに参加してください。
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* チーム作成 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <p className="text-xs font-black text-white">チームを作成（管理者になる）</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                    placeholder="チーム名"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleCreateTeam}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    作成
                  </button>
                </div>
              </div>

              {/* チーム参加 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <p className="text-xs font-black text-white">参加コードで参加（メンバーになる）</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoinTeam()}
                    placeholder="例: A1B2C3"
                    maxLength={6}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 tracking-widest"
                  />
                  <button
                    onClick={handleJoinTeam}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    参加
                  </button>
                </div>
                {recentCodes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-[10px] font-bold text-slate-500 w-full mb-1 uppercase tracking-tighter">履歴から選択:</p>
                    {recentCodes.map(c => (
                      <button
                        key={c}
                        onClick={() => setJoinCode(c)}
                        className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {error && <p className="text-xs font-bold text-rose-500 text-center">{error}</p>}
          </div>
        ) : (
          /* ── リダイレクト中 ── */
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            <p className="text-slate-400 text-sm font-bold">リダイレクト中...</p>
          </div>
        )
        }

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Powered by Gemini AI
        </div>
      </motion.div >
    </div >
  );
}
