import React from 'react';
import { Activity as ActivityType } from './types';
import { Activity } from 'lucide-react';

interface ActivityLogProps {
    activities: ActivityType[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                <Activity size={16} className="text-indigo-500" />
                Activity History
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {activities.map(log => (
                    <div key={log.id} className="relative flex items-center justify-between group">
                        <div className="flex items-start gap-3 w-3/4">
                            <div className="w-2 h-2 shrink-0 rounded-full bg-slate-300 ring-4 ring-white relative z-10 group-hover:bg-primary transition-colors mt-1.5"></div>
                            <div className="text-sm">
                                <div className="font-semibold text-slate-800">{log.user}</div>
                                <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                    <span className="font-medium text-slate-700">{log.target}</span> を<br />{log.action}
                                </div>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-green-600 bg-green-50 px-1.5 rounded inline-block">{log.points}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{log.time}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg transition-colors border border-slate-200">
                すべての履歴を表示する
            </button>
        </div>
    );
}
