'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import CalendarView from '../../components/shared/CalendarView';
import { TaskStatus, User, Project, ChatMessage, Activity } from '../../components/shared/types';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    loadState,
    projectsForCurrentTeam,
    updateTaskStatus,
    pendingReviewCount
} from '@/lib/trainState';
import { Sparkles, Layout, Calendar } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const tabs = [
        { id: 'tasks', label: 'タスク', icon: <Layout className="w-3 h-3" /> },
        { id: 'calendar', label: 'カレンダー', icon: <Calendar className="w-3 h-3" /> }
    ] as const;
    type TabId = (typeof tabs)[number]['id'];

    const [activeTab, setActiveTab] = useState<TabId>('tasks');
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        const state = loadState();
        return state.user;
    });
    const [projects, setProjects] = useState<Project[] | null>(() => {
        if (typeof window === 'undefined') return null;
        const state = loadState();
        return projectsForCurrentTeam(state);
    });
    const [pendingCount, setPendingCount] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const state = loadState();
        return pendingReviewCount(state);
    });

    useEffect(() => {
        if (!currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    const [chatMessages] = useState<ChatMessage[]>([]);

    const [localChat, setLocalChat] = useState<ChatMessage[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);

    const handleTaskAction = async (projectId: number, taskId: number, currentStatus: TaskStatus) => {
        if (!currentUser) return;

        let nextStatus: TaskStatus = currentStatus;
        if (currentStatus === 'todo') nextStatus = 'in_progress';
        else if (currentStatus === 'in_progress') nextStatus = 'in_review';

        if (nextStatus === currentStatus) return;

        try {
            const state = loadState();
            const next = updateTaskStatus(state, projectId, taskId, nextStatus);
            setProjects(projectsForCurrentTeam(next));
            setPendingCount(pendingReviewCount(next));
        } catch (err) {
            console.error('Task action error:', err);
        }
    };

    const handleSendChat = (text: string) => {
        if (!currentUser) return;
        const newMsg: ChatMessage = {
            id: Date.now(),
            user: currentUser.name,
            avatar: currentUser.avatar,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLocalChat(prev => [...prev, newMsg]);
    };

    const handleAskAI = async (query: string) => {
        if (!currentUser) return;
        setIsAILoading(true);
        const userMsg: ChatMessage = {
            id: Date.now(),
            user: currentUser.name,
            avatar: currentUser.avatar,
            text: `@ai ${query}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLocalChat(prev => [...prev, userMsg]);

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query })
            });
            const { data } = await res.json();

            const aiMsg: ChatMessage = {
                id: Date.now() + 1,
                user: 'Train AI',
                avatar: '🤖',
                text: data,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setLocalChat(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('AI error:', err);
        } finally {
            setIsAILoading(false);
        }
    };

    if (!projects || !currentUser) return <div className="p-8 text-center text-slate-400">環境を同期中...</div>;

    const allMessages = [...chatMessages, ...localChat];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <Header
                currentUser={currentUser}
                isAdmin={false}
                pendingCount={pendingCount}
                onSwitchRole={() => router.push('/')}
            />

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4"
                    >
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">マイワークスペース</h1>
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

                    {activeTab === 'tasks' ? (
                        <ProjectList
                            projects={projects}
                            isAdmin={false}
                            currentUser={currentUser}
                            team={[currentUser]}
                            onTaskAction={handleTaskAction}
                            onCreateTask={() => { }}
                        />
                    ) : (
                        <CalendarView projects={projects} activities={[]} />
                    )}

                    <ChatBox
                        messages={allMessages}
                        currentUser={currentUser}
                        onSendMessage={handleSendChat}
                        onAskAI={handleAskAI}
                        isAILoading={isAILoading}
                    />
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <ActivityLog activities={[]} />
                </div>
            </main>
        </div>
    );
}
