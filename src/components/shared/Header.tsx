'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Bell, Award, Train } from 'lucide-react';
import { User } from './types';

interface HeaderProps {
    currentUser: User;
    isAdmin: boolean;
    onSwitchRole: () => void;
}

export default function Header({ currentUser, isAdmin, onSwitchRole }: HeaderProps) {
    const handleLogout = () => {
        try {
            localStorage.removeItem('train_user');
        } catch {
            // ignore
        }
        onSwitchRole();
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

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
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
        </header>
    );
}
