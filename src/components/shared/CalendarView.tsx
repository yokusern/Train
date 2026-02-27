'use client';

import React from 'react';
import { Project, Activity } from './types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
    projects: Project[];
    activities: Activity[];
}

export default function CalendarView({ projects, activities }: CalendarViewProps) {
    // 簡易的なカレンダー表示（モック）
    const days = ['月', '火', '水', '木', '金', '土', '日'];
    const today = new Date().getDate();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-indigo-500" /> チームスケジュール
                </h3>
                <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-slate-900 dark:text-white">2026年 2月</p>
                    <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5">
                {days.map(day => (
                    <div key={day} className="bg-slate-50 dark:bg-slate-800/50 py-3 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
                    </div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = dayNum === today;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 min-h-[100px] p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-xs font-black",
                                    isToday ? "w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20" : "text-slate-400"
                                )}>
                                    {dayNum}
                                </span>
                            </div>

                            {/* デモ用のダミーイベント */}
                            {dayNum === 27 && (
                                <div className="bg-indigo-500/10 border-l-2 border-indigo-500 p-1.5 rounded-r-md">
                                    <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 truncate">LPデザインFIX</p>
                                </div>
                            )}
                            {dayNum === 28 && (
                                <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-1.5 rounded-r-md">
                                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 truncate">本番DB移行</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ヘルパー関数
function cn(...inputs: Array<string | false | null | undefined>) {
    return inputs.filter(Boolean).join(' ');
}
