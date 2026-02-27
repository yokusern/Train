'use client';

import React, { useState } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import CalendarView from '../../components/shared/CalendarView';
import { initialTeam, initialProjects, initialActivities, initialChatMessages } from '../../lib/mockData';
import { TaskStatus, User, Project, Task, ChatMessage } from '../../components/shared/types';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>('tasks');

    // MOCK: Local state for admin
    const [currentUser] = useState<User>(initialTeam[0]); // Alex (Admin)
    const [team, setTeam] = useState<User[]>(initialTeam);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [activities, setActivities] = useState(initialActivities);
    const [chatMessages, setChatMessages] = useState(initialChatMessages);

    const handleTaskAction = (projectId: number, taskId: number, currentStatus: TaskStatus, points: number, currentAssignee: number | null, category?: string) => {
        let nextStatus: TaskStatus = currentStatus;
        let earnedPoints = 0;
        let newPendingPoints = 0;
        let taskName = '';
        let assigneeId = currentAssignee || currentUser.id;
        let actionLog = '';

        if (currentStatus === 'in_review') {
            nextStatus = 'done';
            earnedPoints = points;
            newPendingPoints = -points;
            actionLog = '承認してポイントを付与しました';
        } else if (currentStatus === 'todo' || currentStatus === 'in_progress') {
            nextStatus = 'done';
            earnedPoints = points;
            actionLog = '完了として処理しました';
        }

        if (nextStatus === currentStatus) return;

        setProjects(projects.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    taskName = t.title;
                    return { ...t, status: nextStatus, assigneeId };
                })
            };
        }));

        if (earnedPoints !== 0 || newPendingPoints !== 0) {
            setTeam(team.map(u => {
                if (u.id === assigneeId) {
                    const updatedSkills = { ...u.skillScore } as Record<string, number>;
                    if (category && earnedPoints > 0) {
                        updatedSkills[category] = (updatedSkills[category] || 0) + earnedPoints;
                    }
                    return {
                        ...u,
                        points: u.points + earnedPoints,
                        pendingPoints: Math.max(0, u.pendingPoints + newPendingPoints),
                        skillScore: updatedSkills
                    };
                }
                return u;
            }));
        }

        const newActivity = {
            id: Date.now(),
            user: currentUser.name,
            action: actionLog,
            target: taskName,
            points: `+${earnedPoints}`,
            time: 'たった今'
        };
        setActivities([newActivity, ...activities]);

        if (earnedPoints > 0) {
            const assignedUser = team.find(u => u.id === assigneeId);
            const systemMsg: ChatMessage = {
                id: Date.now() + 1,
                user: 'System Notification',
                avatar: '🤖',
                text: `${assignedUser?.name}さんの "${taskName}" が承認されました！ 🎉 ${earnedPoints}pt獲得！`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages([...chatMessages, systemMsg]);
        }
    };

    const handleCreateTask = (projectId: number, title: string, points: number, assigneeId: number | null, category?: string) => {
        const newTask: Task = {
            id: Date.now(),
            title,
            status: 'todo',
            points,
            assigneeId,
            deadline: '未定',
            category: category
        };

        setProjects(projects.map(p => {
            if (p.id !== projectId) return p;
            return { ...p, tasks: [...p.tasks, newTask] };
        }));

        const newActivity = {
            id: Date.now(),
            user: currentUser.name,
            action: 'タスクを作成しました',
            target: title,
            points: '-',
            time: 'たった今'
        };
        setActivities([newActivity, ...activities]);
    };

    const handleSendChat = (text: string) => {
        const newMsg = {
            id: Date.now(),
            user: currentUser.name,
            avatar: currentUser.avatar,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([...chatMessages, newMsg]);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
            <Header currentUser={currentUser} isAdmin={true} onSwitchRole={() => router.push('/')} />

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300 pb-4 gap-4">
                        <h1 className="text-2xl font-bold text-slate-900">管理者ダッシュボード</h1>
                        <div className="flex gap-1 bg-slate-200 p-1 rounded-lg self-start sm:self-auto shadow-sm">
                            {['tasks', 'calendar'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab === 'tasks' ? 'リスト表示' : 'カレンダー'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'tasks' ? (
                        <ProjectList
                            projects={projects}
                            isAdmin={true}
                            currentUser={currentUser}
                            team={team}
                            onTaskAction={handleTaskAction}
                            onCreateTask={handleCreateTask}
                        />
                    ) : (
                        <CalendarView projects={projects} activities={activities} />
                    )}

                    <ChatBox messages={chatMessages} currentUser={currentUser} onSendMessage={handleSendChat} />
                </div>

                <div className="lg:col-span-1 space-y-8">
                    {/* Leaderboard only visible to Admin generally, or members see a sanitized one. We show full here */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between mb-4">
                            <span>🏆 貢献度ランキング</span>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">今週</span>
                        </h3>

                        <div className="space-y-4">
                            {[...team].sort((a, b) => b.points - a.points).map((user, idx) => (
                                <div key={user.id} className="flex flex-col gap-1 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-black w-4 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                                                {idx + 1}
                                            </span>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 bg-slate-100 text-slate-600 border-slate-200">
                                                {user.avatar}
                                            </div>
                                            <span className="text-sm font-semibold truncate max-w-[80px] sm:max-w-none text-slate-800">
                                                {user.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100 shrink-0">
                                            {user.points} <span className="text-[10px] text-slate-500 font-medium">Pt</span>
                                        </span>
                                    </div>
                                    {user.pendingPoints > 0 && (
                                        <div className="text-[10px] font-semibold text-amber-600 text-right w-full">
                                            +{user.pendingPoints} 承認待ち
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <ActivityLog activities={activities} />
                </div>
            </main>
        </div>
    );
}
