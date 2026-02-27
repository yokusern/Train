'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { User } from './types';

interface SkillMatrixProps {
    user: User;
}

export default function SkillMatrix({ user }: SkillMatrixProps) {
    // デフォルトのカテゴリと初期スコア
    const defaultSkills = {
        'UI/UX': 100,
        'Frontend': 100,
        'Backend': 100,
        'Planning': 100,
        'Review': 100,
    };

    const currentSkills = user.skillScore || defaultSkills;

    const data = Object.entries(currentSkills).map(([subject, fullMark]) => ({
        subject,
        A: fullMark,
        fullMark: Math.max(...Object.values(currentSkills), 500) // 動的に最大値を調整
    }));

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📊 スキルマトリクス</h3>
            <p className="text-xs text-slate-500 mb-4">タスク完了による成長度</p>

            <div className="h-64 w-full min-h-[256px] min-w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar
                            name={user.name}
                            dataKey="A"
                            stroke="#0f172a"
                            fill="#0f172a"
                            fillOpacity={0.2}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(currentSkills).map(([subject, score]) => (
                    <div key={subject} className="flex justify-between items-center text-xs bg-slate-50 px-2 py-1.5 rounded">
                        <span className="font-semibold text-slate-600">{subject}</span>
                        <span className="font-bold text-slate-900">{score} pt</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
