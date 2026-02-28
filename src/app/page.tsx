'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Train, User as UserIcon, Sparkles, LogIn, Loader2, Users, KeyRound, Copy, Check } from 'lucide-react';
import { loadState, saveState, createUser, createTeam, joinTeamByCode, isTeamAdmin, getCurrentTeam } from '@/lib/trainState';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [hasUser, setHasUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (state.user) {
      setHasUser(true);
      if (state.user.currentTeamId) {
        // ロールに基づいてリダイレクト
        const admin = isTeamAdmin(state, state.user.currentTeamId);
        router.push(admin ? '/admin' : '/dashboard');
      }
    }
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
      const state = loadState();
      const user = createUser(name.trim());
      const next = { ...state, user };
      saveState(next);
      setHasUser(true);
    } catch {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = () => {
    const n = teamName.trim();
    if (!n) {
      setError('チーム名を入力してください');
      return;
    }
    setError('');
    const next = createTeam(loadState(), n);
    setTeamName('');
    if (next.user?.currentTeamId) {
      // チーム作成者は必ず Admin → /admin へ
      router.push('/admin');
    }
  };

  const handleJoinTeam = () => {
    const code = joinCode.trim().toUpperCase();
    // 6桁の英数字大文字（新形式）または旧形式（4〜6桁数字）を許容
    if (!/^[A-Z0-9]{4,6}$/.test(code)) {
      setError('参加コードは4〜6桁の英数字です');
      return;
    }
    setError('');
    const res = joinTeamByCode(loadState(), code);
    if (res.error === 'invalid_code') {
      setError('参加コードが見つかりません');
      return;
    }
    setJoinCode('');
    if (res.state.user?.currentTeamId) {
      // ロールに基づいてリダイレクト
      const admin = isTeamAdmin(res.state, res.state.user.currentTeamId);
      router.push(admin ? '/admin' : '/dashboard');
    }
  };

  const handleCopyCode = () => {
    const state = loadState();
    const team = getCurrentTeam(state);
    if (team) {
      navigator.clipboard.writeText(team.joinCode).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      });
    }
  };

  const state = hasUser ? loadState() : null;
  const needsTeam = !!state?.user && !state.user.currentTeamId;
  const currentTeam = state ? getCurrentTeam(state) : null;

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

        {!hasUser ? (
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
              ようこそ、<span className="text-white">{state?.user?.name}</span> さん！<br />
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
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Powered by Gemini AI
        </div>
      </motion.div>
    </div>
  );
}
