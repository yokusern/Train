'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import CalendarView from '../../components/shared/CalendarView';
import { TaskStatus, User, Project, ChatMessage, Activity, Team, Role } from '../../components/shared/types';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Layout, Calendar } from 'lucide-react';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardPage() {
    const router = useRouter();
    const tabs = [
        { id: 'tasks', label: 'タスク', icon: <Layout className="w-3 h-3" /> },
        { id: 'calendar', label: 'カレンダー', icon: <Calendar className="w-3 h-3" /> }
    ] as const;
    type TabId = (typeof tabs)[number]['id'];

    const [activeTab, setActiveTab] = useState<TabId>('tasks');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/');
            return;
        }
        const u = getStorageItem<User>('user');
        if (u) {
            setCurrentUser(u);
        } else {
            router.push('/');
        }
    }, [router]);

    const fetchData = async () => {
        if (!currentUser?.id || !currentUser?.currentTeamId) return;
        try {
            const [projRes, teamRes, actRes, chatRes] = await Promise.all([
                fetch(`/api/projects?teamId=${currentUser.currentTeamId}`),
                fetch(`/api/teams?userId=${currentUser.id}`),
                fetch(`/api/activity?teamId=${currentUser.currentTeamId}`),
                fetch(`/api/chat?teamId=${currentUser.currentTeamId}`)
            ]);
            const projData = await projRes.json();
            const teamData = await teamRes.json();
            const actData = await actRes.json();
            const chatData = await chatRes.json();

            if (!projData.error) setProjects(projData);
            if (!teamData.error) setTeams(teamData);
            if (!actData.error) setActivities(actData.map((a: any) => ({
                id: a.id,
                user: a.user.name,
                avatar: a.user.avatar,
                action: a.action,
                target: a.target,
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                points: a.pointsEarned
            })));
            if (!chatData.error) setChatMessages(chatData);

            // Simplified pending count from projects
            const count = projData.reduce((acc: number, p: Project) =>
                acc + (p.tasks?.filter(t => t.status === 'in_review').length || 0), 0);
            setPendingCount(count);
        } catch (err) {
            console.error('Fetch dashboard data error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchData();
    }, [currentUser?.currentTeamId]);

    const [localChat, setLocalChat] = useState<ChatMessage[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);

    const handleTaskAction = async (projectId: number, taskId: number, currentStatus: TaskStatus) => {
        if (!currentUser) return;

        let nextStatus: TaskStatus = currentStatus;
        if (currentStatus === 'todo') nextStatus = 'in_progress';
        else if (currentStatus === 'in_progress') nextStatus = 'in_review';

        if (nextStatus === currentStatus) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, status: nextStatus, assigneeId: currentUser.id })
            });
            if (res.ok) fetchData();
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

    const handleLeaveTeam = async (teamId: number) => {
        if (!currentUser) return;
        try {
            const res = await fetch(`/api/teams?userId=${currentUser.id}&teamId=${teamId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '脱退に失敗しました');

            const remainingTeams = teams.filter(t => t.id !== teamId);
            const nextTeamId = remainingTeams.length > 0 ? remainingTeams[0].id : null;

            const updatedUser = {
                ...currentUser,
                currentTeamId: nextTeamId,
                role: (nextTeamId ? (remainingTeams[0].adminUserId === currentUser.id ? 'ADMIN' : 'MEMBER') : 'MEMBER') as Role
            };

            setStorageItem('user', updatedUser);
            setCurrentUser(updatedUser);

            if (!nextTeamId) {
                router.push('/');
            } else {
                fetchData();
            }
        } catch (err: any) {
            throw err;
        }
    };

    if (isLoading || !currentUser) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse mx-auto" />
                <p className="text-slate-400 text-sm font-bold">環境を同期中...</p>
            </div>
        </div>
    );

    const allMessages = [...chatMessages, ...localChat];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <Header
                currentUser={currentUser}
                isAdmin={currentUser.role === 'ADMIN'}
                teams={teams}
                pendingCount={pendingCount}
                onSwitchRole={() => router.push('/')}
                onSwitchTeam={async (teamId) => {
                    const updatedUser = { ...currentUser, currentTeamId: teamId };
                    setStorageItem('user', updatedUser);
                    setCurrentUser(updatedUser);
                }}
                onLeaveTeam={handleLeaveTeam}
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
                    <ActivityLog activities={activities} />
                </div>
            </main>
        </div>
    );
}
