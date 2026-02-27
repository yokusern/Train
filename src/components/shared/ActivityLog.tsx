'use client';

import React from 'react';
import { Activity } from './types';
import { motion } from 'framer-motion';
import { History, Zap, CheckCircle2, MessageSquare } from 'lucide-react';

interface ActivityLogProps {
    activities: Activity[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
    const getIcon = (action: string) => {
        if (action.includes('完了') || action.includes('承認')) return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
        if (action.includes('チャット')) return <MessageSquare className="w-3 h-3 text-indigo-500" />;
        return <Zap className="w-3 h-3 text-amber-500" />;
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <History className="w-4 h-4" /> アクティビティログ
                </h3>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">履歴がありません</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity, idx) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {getIcon(activity.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                                {activity.user}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                {activity.time}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">&quot;{activity.target}&quot;</span> {activity.action}
                                        </p>
                                        {activity.points !== '-' && (
                                            <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase border border-indigo-100 dark:border-indigo-500/20">
                                                <Zap className="w-2.5 h-2.5" /> {activity.points}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
