'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import CalendarView from '../../components/shared/CalendarView';
import { TaskStatus, User, Project, ChatMessage } from '../../components/shared/types';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Users, Target, Layout, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadProjects, saveProjects, addProject, addTask, updateTaskStatus } from '@/lib/projectStore';

export default function AdminPage() {
    const router = useRouter();
    const tabs = [
        { id: 'tasks', label: 'タスク', icon: <Layout className="w-3 h-3" /> },
        { id: 'calendar', label: 'カレンダー', icon: <Calendar className="w-3 h-3" /> }
    ] as const;
    type TabId = (typeof tabs)[number]['id'];

    const [activeTab, setActiveTab] = useState<TabId>('tasks');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('train_user');
        if (saved) {
            const user = JSON.parse(saved);
            if (user.role !== 'ADMIN') {
                router.push('/dashboard');
            } else {
                setCurrentUser(user);
                setProjects(loadProjects());
                // 管理画面のランキング用に、現在ログイン中ユーザーのみ表示（将来拡張用）
                setUsers([user]);
            }
        } else {
            router.push('/');
        }
    }, [router]);

    const [localChat, setLocalChat] = useState<ChatMessage[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);

    const handleTaskAction = async (projectId: number, taskId: number, currentStatus: TaskStatus, points: number, currentAssignee: number | null) => {
        if (!currentUser) return;

        let nextStatus: TaskStatus = currentStatus;
        let actionType = '';

        if (currentStatus === 'in_review') {
            nextStatus = 'done';
            actionType = 'points_awarded';
        } else if (currentStatus === 'todo' || currentStatus === 'in_progress') {
            nextStatus = 'done';
            actionType = 'task_completed';
        }

        if (nextStatus === currentStatus) return;

        try {
            setProjects(prev => (prev ? updateTaskStatus(prev, projectId, taskId, nextStatus, currentAssignee) : prev));
        } catch (err) {
            console.error('Admin task action error:', err);
        }
    };

    const handleCreateTask = async (projectId: number, title: string, points: number, assigneeId: number | null, category?: string) => {
        setProjects(prev => (prev ? addTask(prev, projectId, title, points, assigneeId, category) : prev));
    };

    const handleCreateProject = () => {
        const name = newProjectName.trim();
        if (!name || !projects) return;
        const next = addProject(projects, name, '📁');
        setProjects(next);
        setNewProjectName('');
    };

    if (!projects || !currentUser) return <div className="p-8 text-center text-slate-400">管理コンソールを同期中...</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <Header currentUser={currentUser} isAdmin={true} onSwitchRole={() => router.push('/')} />

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4"
                    >
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">管理コンソール</h1>
                        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl glass shadow-inner">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                                        activeTab === tab.id
                                            ? "bg-white dark:bg-slate-700 shadow-premium text-slate-900 dark:text-white"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* プロジェクト追加フォーム */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="新しいプロジェクト名を入力..."
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            onClick={handleCreateProject}
                            disabled={!newProjectName.trim()}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl bg-indigo-600 disabled:opacity-40 text-white hover:bg-indigo-500 transition-colors"
                        >
                            追加
                        </button>
                    </div>

                    {activeTab === 'tasks' ? (
                        <ProjectList
                            projects={projects}
                            isAdmin={true}
                            currentUser={currentUser}
                            team={users}
                            onTaskAction={handleTaskAction}
                            onCreateTask={handleCreateTask}
                        />
                    ) : (
                        <CalendarView projects={projects} activities={[]} />
                    )}

                    <ChatBox
                        messages={localChat}
                        currentUser={currentUser}
                        onSendMessage={(text) => setLocalChat(prev => [...prev, { id: Date.now(), user: currentUser.name, avatar: currentUser.avatar, text, time: 'Now' }])}
                        onAskAI={() => { }}
                        isAILoading={false}
                    />
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" /> リーダーボード
                            </h3>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            {users.sort((a, b) => b.points - a.points).map((user, idx) => (
                                <div key={user.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-300 group-hover:text-indigo-500 transition-colors w-4">{idx + 1}</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{user.rank}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900 dark:text-white">{user.points} pt</p>
                                        {user.pendingPoints > 0 && (
                                            <p className="text-[9px] font-bold text-amber-600">+{user.pendingPoints} PENDING</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium">
                            <Users className="w-4 h-4 text-indigo-500 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">チーム人数</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{users.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium">
                            <Target className="w-4 h-4 text-emerald-500 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">プロジェクト数</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{projects.length}</p>
                        </div>
                    </div>

                    <ActivityLog activities={[]} />
                </div>
            </main>
        </div>
    );
}
