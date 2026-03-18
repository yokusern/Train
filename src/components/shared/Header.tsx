'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Bell, Award, Train } from 'lucide-react';
import { User, Team } from './types';

import { logout } from '@/lib/auth';

interface HeaderProps {
    currentUser: User;
    isAdmin: boolean;
    teams?: Team[];
    pendingCount?: number;
    onSwitchRole: () => void;
    onSwitchTeam?: (teamId: number) => void;
    onLeaveTeam?: (teamId: number) => Promise<void>;
}

export default function Header({ currentUser, isAdmin, teams = [], pendingCount = 0, onSwitchRole, onSwitchTeam, onLeaveTeam }: HeaderProps) {
    const [isLeaving, setIsLeaving] = React.useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = React.useState(false);

    const handleLogout = async () => {
        await logout();
    };


    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Train className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">TRAIN</span>
                            <div className="flex gap-1">
                                <div className="h-1 w-4 bg-indigo-500 rounded-full" />
                                <div className="h-1 w-1 bg-indigo-500/50 rounded-full" />
                            </div>
                        </div>
                    </motion.div>

                    <nav className="hidden md:flex items-center gap-6">
                        {['ダッシュボード', 'プロジェクト', 'チーム'].map((item) => (
                            <button key={item} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* Team selector */}
                    <div className="hidden sm:flex items-center gap-2">
                        {teams && teams.length > 0 && (
                            <select
                                value={currentUser.currentTeamId ?? ''}
                                onChange={(e) => {
                                    const teamId = Number(e.target.value);
                                    if (onSwitchTeam) onSwitchTeam(teamId);
                                }}
                                className="bg-white/5 border border-white/10 text-white text-xs font-black rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                aria-label="チーム切り替え"
                            >
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {currentUser.currentTeamId && (
                            <button
                                onClick={() => setShowLeaveConfirm(true)}
                                className="ml-1 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter"
                                title="チームを脱退"
                            >
                                脱退
                            </button>
                        )}
                    </div>
                    {isAdmin && (
                        <div className="hidden sm:flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">現在のランク</span>
                                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{currentUser.rank}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-black text-slate-900 dark:text-white">{currentUser.points} <span className="text-[10px] text-slate-400 font-bold uppercase">PT</span></span>
                            </div>
                            {currentUser.pendingPoints > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <span className="text-[10px] font-black text-amber-600">+{currentUser.pendingPoints} 承認待ち</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            {pendingCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                                    {pendingCount}
                                </span>
                            )}
                            {pendingCount === 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                            )}
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{currentUser.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? '管理者' : 'メンバー'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10">
                                {currentUser.avatar}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                            title="ログアウト"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Leave Team Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => !isLeaving && setShowLeaveConfirm(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-2xl"
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">チームを脱退しますか？</h3>
                        <p className="text-sm text-slate-500 font-bold mb-6 leading-relaxed">
                            チームから脱退しても、あなたのデータ（ポイントや貢献履歴）は保持されます。<br />
                            <span className="text-indigo-500 mt-2 block italic">「チームコードを控えれば、後で再参加可能です」</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                disabled={isLeaving}
                                onClick={async () => {
                                    if (!onLeaveTeam || !currentUser.currentTeamId) return;
                                    setIsLeaving(true);
                                    try {
                                        await onLeaveTeam(currentUser.currentTeamId);
                                        setShowLeaveConfirm(false);
                                    } catch (err: any) {
                                        alert(err.message || 'エラーが発生しました');
                                    } finally {
                                        setIsLeaving(false);
                                    }
                                }}
                                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all"
                            >
                                {isLeaving ? '処理中...' : 'チームを抜ける'}
                            </button>
                            <button
                                disabled={isLeaving}
                                onClick={() => setShowLeaveConfirm(false)}
                                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-3 rounded-xl transition-all"
                            >
                                キャンセル
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </header>
    );
}
