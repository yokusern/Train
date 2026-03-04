'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/shared/Header';
import ProjectList from '../../components/shared/ProjectList';
import ActivityLog from '../../components/shared/ActivityLog';
import ChatBox from '../../components/shared/ChatBox';
import CalendarView from '../../components/shared/CalendarView';
import { TaskStatus, User, Project, ChatMessage, PointHistory, Team, Activity } from '../../components/shared/types';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, TrendingUp, Users, Target, Layout, Calendar,
  BarChart3, Copy, Check, KeyRound, Zap, Award, Clock, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'tasks' | 'calendar' | 'points';

export default function AdminPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [pointSummary, setPointSummary] = useState<
    { userId: number; userName: string; totalPoints: number; taskCount: number }[]
  >([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('tasks');
  const [newProjectName, setNewProjectName] = useState('');
  const [localChat, setLocalChat] = useState<ChatMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const savedUser = localStorage.getItem('train_user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const user = JSON.parse(savedUser) as User;
    setCurrentUser(user);

    if (!user.currentTeamId) {
      router.push('/');
      return;
    }

    try {
      const [projRes, teamRes, usersRes, actRes] = await Promise.all([
        fetch(`/api/projects?teamId=${user.currentTeamId}`),
        fetch(`/api/teams?userId=${user.id}`),
        fetch(`/api/users`),
        fetch(`/api/activity?teamId=${user.currentTeamId}`)
      ]);

      const projData = await projRes.json();
      const teamsData = await teamRes.json();
      const usersData = await usersRes.json();
      const actData = await actRes.json();

      if (!projData.error) setProjects(projData);
      if (!teamsData.error) {
        setTeams(teamsData);
        const currentTeam = teamsData.find((t: any) => t.id === user.currentTeamId);
        if (currentTeam) setJoinCode(currentTeam.joinCode);
      }
      if (!actData.error) setActivities(actData.map((a: any) => ({
        id: a.id,
        user: a.user.name,
        avatar: a.user.avatar,
        action: a.action,
        target: a.target,
        time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        points: a.pointsEarned
      })));

      if (!usersData.error) {
        setTeamMembers(usersData); // Simplified: show all users as potential team members for now

        // Generate point summary from users
        const summary = usersData.map((u: User) => ({
          userId: u.id,
          userName: u.name,
          totalPoints: u.points,
          taskCount: 0 // Need API update for task count
        })).sort((a: any, b: any) => b.totalPoints - a.totalPoints);
        setPointSummary(summary);
      }

      const count = projData.reduce((acc: number, p: Project) =>
        acc + (p.tasks?.filter(t => t.status === 'in_review').length || 0), 0);
      setPendingCount(count);

    } catch (err) {
      console.error('Admin page fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskAction = async (
    projectId: number,
    taskId: number,
    currentStatus: TaskStatus,
  ) => {
    if (!currentUser) return;
    let nextStatus: TaskStatus = currentStatus;
    if (currentStatus === 'in_review') nextStatus = 'done';
    else if (currentStatus === 'todo' || currentStatus === 'in_progress') nextStatus = 'done';
    if (nextStatus === currentStatus) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Admin task action error:', err);
    }
  };

  const handleCreateTask = async (
    projectId: number,
    title: string,
    points: number,
    _assigneeId: number | null,
    category?: string,
    deadline?: string,
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          teamId: currentUser.currentTeamId,
          title,
          points,
          createdByUserId: currentUser.id,
          category,
          deadline
        })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Admin create task error:', err);
    }
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name || !currentUser) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          teamId: currentUser.currentTeamId,
          createdByUserId: currentUser.id
        })
      });
      if (res.ok) {
        fetchData();
        setNewProjectName('');
      }
    } catch (err) {
      console.error('Admin create project error:', err);
    }
  };

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const handleAskAI = async (query: string) => {
    if (!currentUser) return;
    setIsAILoading(true);
    const userMsg: ChatMessage = {
      id: Date.now(),
      user: currentUser.name,
      avatar: currentUser.avatar,
      text: `@ai ${query}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalChat((prev) => [...prev, userMsg]);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const { data } = await res.json();
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        user: 'Train AI',
        avatar: '🤖',
        text: data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setLocalChat((prev) => [...prev, aiMsg]);
    } catch {
      // ignore
    } finally {
      setIsAILoading(false);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse mx-auto" />
          <p className="text-slate-400 text-sm font-bold">管理コンソールを同期中...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tasks' as TabId, label: 'タスク', icon: <Layout className="w-3 h-3" /> },
    { id: 'calendar' as TabId, label: 'カレンダー', icon: <Calendar className="w-3 h-3" /> },
    {
      id: 'points' as TabId,
      label: 'ポイント集計',
      icon: <BarChart3 className="w-3 h-3" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Header
        currentUser={currentUser}
        isAdmin={true}
        teams={teams}
        pendingCount={pendingCount}
        onSwitchRole={() => router.push('/')}
        onSwitchTeam={async (teamId) => {
          const updatedUser = { ...currentUser, currentTeamId: teamId };
          localStorage.setItem('train_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }}
      />

      <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── 左カラム（メインコンテンツ） ── */}
        <div className="lg:col-span-3 space-y-8">
          {/* タイトル & タブ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                管理コンソール
              </h1>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl shadow-inner">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2',
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                  )}
                >
                  {tab.icon} {tab.label}
                  {tab.id === 'tasks' && pendingCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* プロジェクト追加フォーム（タスクタブのみ） */}
          {activeTab === 'tasks' && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
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
          )}

          {/* タブコンテンツ */}
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProjectList
                  projects={projects}
                  isAdmin={true}
                  currentUser={currentUser}
                  team={teamMembers}
                  onTaskAction={(projectId, taskId, currentStatus) =>
                    handleTaskAction(projectId, taskId, currentStatus)
                  }
                  onCreateTask={handleCreateTask}
                />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CalendarView projects={projects} activities={[]} />
              </motion.div>
            )}

            {activeTab === 'points' && (
              <motion.div
                key="points"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* ポイント集計サマリー */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      メンバー別ポイント集計
                    </h3>
                  </div>
                  {pointSummary.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        まだポイント履歴がありません
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {pointSummary.map((s, idx) => (
                        <div
                          key={s.userId}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="text-xs font-black text-slate-400 w-5">{idx + 1}</span>
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-sm text-indigo-600 dark:text-indigo-400">
                            {s.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{s.userName}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{s.taskCount} タスク完了</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              {s.totalPoints}
                              <span className="text-[10px] text-slate-400 font-bold ml-1">PT</span>
                            </p>
                          </div>
                          {/* ポイントバー */}
                          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (s.totalPoints / (pointSummary[0]?.totalPoints || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ポイント付与履歴 */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      ポイント付与履歴
                    </h3>
                  </div>
                  {pointHistory.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        まだ履歴がありません
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {pointHistory.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {h.taskTitle}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {h.userName} ·{' '}
                              {new Date(h.awardedAt).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                            <Award className="w-3 h-3 text-indigo-500" />
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                              +{h.points} PT
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ChatBox
            messages={localChat}
            currentUser={currentUser}
            onSendMessage={(text) =>
              setLocalChat((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  user: currentUser.name,
                  avatar: currentUser.avatar,
                  text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            onAskAI={handleAskAI}
            isAILoading={isAILoading}
          />
        </div>

        {/* ── 右カラム（サイドバー） ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* 参加コード表示 */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-4 h-4 text-purple-500" />
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">チーム参加コード</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-mono">
                  {joinCode}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                title="コードをコピー"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 text-center font-bold">
              このコードをメンバーに共有してください
            </p>
          </section>

          {/* リーダーボード */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> リーダーボード
              </h3>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            {pointSummary.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-bold">まだデータがありません</p>
            ) : (
              <div className="space-y-4">
                {pointSummary.slice(0, 5).map((s, idx) => (
                  <div key={s.userId} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-300 group-hover:text-indigo-500 transition-colors w-4">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        {s.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{s.userName}</p>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{s.totalPoints} pt</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* チーム統計 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <Users className="w-4 h-4 text-indigo-500 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">チーム人数</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{teamMembers.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
              <Target className="w-4 h-4 text-emerald-500 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">プロジェクト数</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{projects.length}</p>
            </div>
          </div>

          <ActivityLog activities={activities} />
        </div>
      </main>
    </div>
  );
}
