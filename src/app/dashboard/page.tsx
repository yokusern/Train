'use client';

import React, { useState } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import SkillMatrix from '../../components/shared/SkillMatrix';
import CalendarView from '../../components/shared/CalendarView';
import { initialTeam, initialProjects, initialActivities, initialChatMessages } from '../../lib/mockData';
import { TaskStatus, User, Project, ChatMessage } from '../../components/shared/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>('tasks');

    // MOCK: Local state for testing logic
    const [currentUser] = useState<User>(initialTeam[1]); // Sarah (Member)
    const [team, setTeam] = useState<User[]>(initialTeam);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [activities, setActivities] = useState(initialActivities);
    const [chatMessages, setChatMessages] = useState(initialChatMessages);

    const handleTaskAction = (projectId: number, taskId: number, currentStatus: TaskStatus, points: number, currentAssignee: number | null, category?: string) => {
        let nextStatus: TaskStatus = currentStatus;
        let newPendingPoints = 0;
        let taskName = '';
        let assigneeId = currentAssignee || currentUser.id;
        let actionLog = '';

        if (currentStatus === 'todo') {
            nextStatus = 'in_progress';
            actionLog = '着手しました';
        } else if (currentStatus === 'in_progress') {
            nextStatus = 'in_review';
            newPendingPoints = points;
            actionLog = '完了報告を上げました（承認待ち）';
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

        if (newPendingPoints !== 0) {
            setTeam(team.map(u =>
                u.id === assigneeId
                    ? { ...u, pendingPoints: Math.max(0, u.pendingPoints + newPendingPoints) }
                    : u
            ));
        }

        // Auto log activity
        const newActivity = {
            id: Date.now(),
            user: currentUser.name,
            action: actionLog,
            target: taskName,
            points: newPendingPoints > 0 ? `+${newPendingPoints} (予定)` : '-',
            time: 'たった今'
        };
        setActivities([newActivity, ...activities]);

        // Auto Chat System Notification
        if (nextStatus === 'in_review') {
            const systemMsg: ChatMessage = {
                id: Date.now() + 1,
                user: 'System Notification',
                avatar: '🤖',
                text: `${currentUser.name}さんが "${taskName}" の完了報告をしました。承認待ちです。`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages([...chatMessages, systemMsg]);
        }
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
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
            <Header currentUser={currentUser} isAdmin={false} onSwitchRole={() => router.push('/')} />

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                        <h1 className="text-2xl font-bold text-slate-900">マイタスク</h1>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto shadow-sm">
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
                            isAdmin={false}
                            currentUser={currentUser}
                            team={team}
                            onTaskAction={handleTaskAction}
                            onCreateTask={() => { }} // Disabled for members
                        />
                    ) : (
                        <CalendarView projects={projects} activities={activities} />
                    )}

                    <ChatBox messages={chatMessages} currentUser={currentUser} onSendMessage={handleSendChat} />
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <SkillMatrix user={currentUser} />
                    <ActivityLog activities={activities} />
                </div>
            </main>
        </div>
    );
}
