'use client';

import React from 'react';
import { User } from './types';
import { motion } from 'framer-motion';
import { Target, Zap, ChevronUp } from 'lucide-react';

interface SkillMatrixProps {
    user: User;
}

export default function SkillMatrix({ user }: SkillMatrixProps) {
    const skills = [
        { name: 'Frontend', color: 'bg-indigo-500' },
        { name: 'Backend', color: 'bg-emerald-500' },
        { name: 'UI/UX', color: 'bg-rose-500' },
        { name: 'Planning', color: 'bg-amber-500' },
        { name: 'Review', color: 'bg-purple-500' }
    ];

    const getScore = (name: string) => user.skillScore?.[name] || 0;
    const maxScore = Math.max(...skills.map(s => getScore(s.name)), 1000);

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" /> スキルマトリックス
                </h3>
            </div>

            <div className="space-y-5">
                {skills.map((skill, idx) => {
                    const score = getScore(skill.name);
                    const percentage = (score / maxScore) * 100;

                    return (
                        <div key={skill.name} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider">{skill.name}</p>
                                <p className="text-[10px] font-black text-slate-400">
                                    <span className="text-sm text-slate-900 dark:text-white">{score}</span> / {maxScore}
                                </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: 0.2 + idx * 0.1, duration: 1, ease: "easeOut" }}
                                    className={`h-full ${skill.color} rounded-full relative shadow-lg shadow-current/20`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">次のランクまで</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white">あと 850pt で昇格可能です！</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
