import React, { useMemo, useState } from 'react';
import { Project, Activity, Task } from './types';
import { Target, Zap } from 'lucide-react';

interface CalendarViewProps {
    projects: Project[];
    activities: Activity[];
}

export default function CalendarView({ projects, activities }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

    // Collect all tasks with deadlines
    const allTasks = useMemo(() => {
        return projects.flatMap(p => p.tasks).filter(t => t.deadline);
    }, [projects]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">

            {/* Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">
                    {year}年 {month + 1}月
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={goToday} className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-200 transition-colors">
                        今日
                    </button>
                    <div className="flex bg-white border border-slate-200 rounded-md p-0.5">
                        <button onClick={prevMonth} className="px-3 py-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">◀</button>
                        <button onClick={nextMonth} className="px-3 py-1 border-l border-slate-100 hover:bg-slate-100 rounded text-slate-600 transition-colors">▶</button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 text-xs font-semibold text-slate-500">
                {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                    <div key={d} className="bg-white py-2 text-center uppercase tracking-widest">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200">
                {blanks.map(b => (
                    <div key={`blank-${b}`} className="bg-slate-50 min-h-[100px]" />
                ))}
                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    // Find tasks due today
                    const dueTasks = allTasks.filter(t => t.deadline.startsWith(dateStr));
                    // Find activities that happened today
                    const dayActivities = activities.filter(a => a.time.startsWith(dateStr));

                    return (
                        <div key={day} className={`bg-white min-h-[100px] p-2 hover:bg-slate-50 transition-colors group relative ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`w-6 h-6 flex items-center justify-center text-sm font-bold rounded-full ${isToday ? 'bg-primary text-white shadow-sm' : 'text-slate-600'}`}>
                                    {day}
                                </span>
                                {(dueTasks.length > 0 || dayActivities.length > 0) && (
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {dueTasks.length + dayActivities.length} items
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1.5 overflow-hidden">
                                {/* Due Tasks */}
                                {dueTasks.map(t => (
                                    <div key={`task-${t.id}`} className="text-[10px] py-1 px-1.5 rounded bg-blue-50 text-blue-700 border border-blue-100 truncate flex items-center gap-1 font-medium">
                                        <Target size={10} className="shrink-0 text-blue-500" /> {t.title}
                                    </div>
                                ))}
                                {/* Activities */}
                                {dayActivities.map(a => (
                                    <div key={`act-${a.id}`} className="text-[10px] py-1 px-1.5 rounded bg-amber-50 text-amber-700 border border-amber-100 truncate flex items-center gap-1 font-medium">
                                        <Zap size={10} className="shrink-0 text-amber-500" /> {a.user}: {a.action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
