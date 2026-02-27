import React from 'react';

export default function MyProfile() {
    const profile = {
        nickname: 'CodeNinja',
        level: 12,
        exp: 450,
        nextLevelExp: 1000,
        gakuchika: 'Lead developer for the university hackathon winning project. Built a real-time collaborative editor using WebSocket and React.',
        hobbies: 'Bouldering, Mechanical Keyboards, Espresso Brewing',
        skills: [
            { name: 'Web Dev', value: 85 },
            { name: 'UI/UX', value: 60 },
            { name: 'Marketing', value: 30 },
            { name: 'Leadership', value: 75 },
            { name: 'Data Sci', value: 40 },
        ]
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Stats & Identity */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass rounded-3xl p-8 text-center relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>

                        <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary to-blue-300 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-2xl mb-4 relative z-10 hover:scale-110 transition-transform">
                            {profile.nickname.charAt(0)}
                        </div>

                        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white relative z-10">
                            {profile.nickname}
                        </h2>

                        <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 relative z-10">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">XCT Level</span>
                                <span className="text-3xl font-black text-primary">{profile.level}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-1 overflow-hidden">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(profile.exp / profile.nextLevelExp) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-right text-slate-400 font-medium">{profile.exp} / {profile.nextLevelExp} EXP</p>
                        </div>
                    </div>

                    {/* Radar Chart Placeholder (using simple bars for now or SVG) */}
                    <div className="glass rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Skill Radar</h3>
                        <div className="space-y-4">
                            {profile.skills.map(skill => (
                                <div key={skill.name}>
                                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                                        <span>{skill.name}</span>
                                        <span>{skill.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${skill.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass rounded-3xl p-8 hover-up">
                        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="text-2xl">🔥</span> Gakuchika
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {profile.gakuchika}
                        </p>
                    </div>

                    <div className="glass rounded-3xl p-8 hover-up">
                        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="text-2xl">🎮</span> Hobbies
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {profile.hobbies}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
