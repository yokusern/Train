'use client';

import React from 'react';
import { User } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Bell, Settings, Award, Layers } from 'lucide-react';

interface HeaderProps {
    currentUser: User;
    isAdmin: boolean;
    onSwitchRole?: () => void;
}

export default function Header({ currentUser, isAdmin, onSwitchRole }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Layers className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Train</span>
                    </motion.div>

                    <nav className="hidden md:flex items-center gap-1">
                        {['Projects', 'Team', 'Analytics'].map((item) => (
                            <button key={item} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50">
                                {item}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentUser.points}</span>
                        </div>
                        {currentUser.pendingPoints > 0 && (
                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                        )}
                        {currentUser.pendingPoints > 0 && (
                            <span className="text-[10px] font-bold text-amber-600">+{currentUser.pendingPoints} PENDING</span>
                        )}
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>

                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1 pl-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold leading-none text-slate-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{currentUser.role === 'ADMIN' ? 'Administrator' : 'Contributor'}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                    {currentUser.avatar}
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={onSwitchRole}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Switch Role"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
