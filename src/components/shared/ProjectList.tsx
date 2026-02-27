import React, { useState } from 'react';
import { Project, Task, TaskStatus, User } from './types';
import { Layout, Server, CheckCircle2, Circle, Clock, PlayCircle, Plus, Edit2, Zap } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
    isAdmin: boolean;
    currentUser: User;
    team: User[];
    onTaskAction: (projectId: number, taskId: number, currentStatus: TaskStatus, points: number, currentAssignee: number | null, category?: string) => void;
    onCreateTask: (projectId: number, title: string, points: number, assigneeId: number | null, category?: string) => void;
}

export default function ProjectList({
    projects, isAdmin, currentUser, team, onTaskAction, onCreateTask
}: ProjectListProps) {

    const [addingTaskProjectId, setAddingTaskProjectId] = useState<number | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPoints, setNewTaskPoints] = useState<number>(10);
    const [newTaskAssignee, setNewTaskAssignee] = useState<number | null>(null);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('Frontend');

    const getUser = (id: number | null) => team.find(u => u.id === id);

    const getStatusInfo = (status: TaskStatus) => {
        switch (status) {
            case 'todo': return { text: '未着手', icon: <Circle size={14} className="text-slate-400" />, classes: 'text-slate-500' };
            case 'in_progress': return { text: '進行中', icon: <PlayCircle size={14} className="text-blue-500" />, classes: 'text-blue-700' };
            case 'in_review': return { text: '確認待ち', icon: <Clock size={14} className="text-amber-500" />, classes: 'text-amber-700' };
            case 'done': return { text: '承認済', icon: <CheckCircle2 size={14} className="text-green-500" />, classes: 'text-slate-400 line-through' };
        }
    };

    const getProjectIcon = (iconName: string) => {
        if (iconName === 'layout') return <Layout size={18} className="text-indigo-500" />;
        if (iconName === 'server') return <Server size={18} className="text-emerald-500" />;
        return <Layout size={18} className="text-slate-500" />;
    };

    const handleCreate = (projectId: number) => {
        if (!newTaskTitle.trim()) return;
        onCreateTask(projectId, newTaskTitle, newTaskPoints, newTaskAssignee, newTaskCategory);
        setAddingTaskProjectId(null);
        setNewTaskTitle('');
        setNewTaskPoints(10);
        setNewTaskAssignee(null);
        setNewTaskCategory('Frontend');
    };

    return (
        <div className="space-y-8">
            {projects.map(project => (
                <div key={project.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold flex items-center gap-2 tracking-wide uppercase text-slate-900">
                            {getProjectIcon(project.icon)} {project.name}
                        </h2>
                        {isAdmin && (
                            <button className="text-sm text-primary font-semibold hover:underline bg-primary/5 px-3 py-1 rounded-md">
                                + プロジェクト設定
                            </button>
                        )}
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className={`hidden sm:grid ${isAdmin ? 'grid-cols-12' : 'grid-cols-11'} gap-4 px-4 py-2 border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest`}>
                            <div className="col-span-4">タスク名</div>
                            <div className="col-span-2">ステータス</div>
                            <div className="col-span-2">担当者</div>
                            {isAdmin && <div className="col-span-1 text-center">Pt</div>}
                            <div className={`col-span-1 text-center ${!isAdmin && 'hidden sm:block'}`}>カテゴリ</div>
                            <div className="col-span-2 text-right">アクション</div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {project.tasks.map(task => {
                                const assignee = getUser(task.assigneeId);
                                const statusInfo = getStatusInfo(task.status);

                                let actionLabel = '';
                                let actionBg = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                                let disabled = false;

                                if (isAdmin) {
                                    if (task.status === 'in_review') { actionLabel = '承認する'; actionBg = 'bg-primary text-white hover:bg-blue-600'; }
                                    else if (task.status === 'todo' || task.status === 'in_progress') { actionLabel = '完了済にする'; }
                                    else { actionLabel = '操作不可'; disabled = true; }
                                } else {
                                    if (task.status === 'todo') { actionLabel = '担当して開始'; actionBg = 'bg-slate-800 text-white hover:bg-slate-700'; }
                                    else if (task.status === 'in_progress') { actionLabel = '完了報告'; actionBg = 'bg-primary text-white hover:bg-blue-600 shadow-sm'; }
                                    else if (task.status === 'in_review') { actionLabel = '確認待ち'; disabled = true; actionBg = 'bg-amber-50 text-amber-600 border border-amber-200'; }
                                    else { actionLabel = '完了済'; disabled = true; actionBg = 'bg-transparent text-slate-400'; }
                                }

                                return (
                                    <div key={task.id} className={`flex flex-col sm:grid ${isAdmin ? 'sm:grid-cols-12' : 'sm:grid-cols-11'} gap-2 sm:gap-4 px-4 py-3 sm:items-center hover:bg-slate-50 transition-colors group`}>

                                        <div className="sm:col-span-4 flex items-start sm:items-center gap-3">
                                            {statusInfo.icon}
                                            <span className={`text-sm font-medium ${statusInfo.classes}`}>
                                                {task.title}
                                            </span>
                                            {isAdmin && task.status !== 'done' && (
                                                <button className="text-[10px] text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2 flex items-center justify-between sm:justify-start">
                                            <span className="sm:hidden text-xs text-slate-400">ステータス:</span>
                                            <span className="text-xs font-medium text-slate-600">
                                                {statusInfo.text}
                                            </span>
                                        </div>

                                        <div className="sm:col-span-2 flex items-center gap-2">
                                            <span className="sm:hidden text-xs text-slate-400">担当:</span>
                                            {assignee ? (
                                                <>
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600 shrink-0">{assignee.avatar}</div>
                                                    <span className={`text-xs font-medium truncate ${currentUser.id === assignee.id ? 'text-primary font-bold' : 'text-slate-600'}`}>{assignee.name}</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 border border-dashed border-slate-300 rounded px-2 py-0.5">未アサイン</span>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <div className="sm:col-span-1 text-left flex items-center sm:justify-center gap-1">
                                                <span className="sm:hidden text-xs text-slate-400">ポイント:</span>
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 border rounded-md transition-colors ${task.status === 'done' ? 'text-slate-400 bg-slate-50 border-slate-200' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                                                    <Zap size={10} className={task.status === 'done' ? 'text-slate-400' : 'text-indigo-500'} /> {task.points}
                                                </span>
                                            </div>
                                        )}

                                        <div className="sm:col-span-1 text-left flex items-center sm:justify-center gap-1">
                                            <span className="sm:hidden text-xs text-slate-400">カテゴリ:</span>
                                            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded-full shadow-sm">
                                                {task.category || 'Uncategorized'}
                                            </span>
                                        </div>

                                        <div className="sm:col-span-2 text-right mt-2 sm:mt-0 flex justify-end">
                                            <button
                                                onClick={() => onTaskAction(project.id, task.id, task.status, task.points, task.assigneeId, task.category)}
                                                disabled={disabled}
                                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all w-full sm:w-auto ${actionBg} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                            >
                                                {actionLabel}
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        {isAdmin && (
                            addingTaskProjectId === project.id ? (
                                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 items-center">
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="タスク名を入力..."
                                        autoFocus
                                        className="flex-1 text-sm border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                                    />
                                    <select
                                        value={newTaskAssignee || ''}
                                        onChange={(e) => setNewTaskAssignee(e.target.value ? Number(e.target.value) : null)}
                                        className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto text-slate-700 bg-white"
                                    >
                                        <option value="">未アサイン</option>
                                        {team.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <select
                                        value={newTaskCategory}
                                        onChange={(e) => setNewTaskCategory(e.target.value)}
                                        className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto text-slate-700 bg-white"
                                    >
                                        <option value="Frontend">Frontend</option>
                                        <option value="Backend">Backend</option>
                                        <option value="UI/UX">UI/UX</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Review">Review</option>
                                    </select>
                                    <div className="flex items-center gap-1 w-full sm:w-auto">
                                        <input
                                            type="number"
                                            value={newTaskPoints}
                                            onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                                            className="w-16 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-right"
                                            min="1"
                                        />
                                        <span className="text-xs text-slate-500 font-medium">Pt</span>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button
                                            onClick={() => handleCreate(project.id)}
                                            disabled={!newTaskTitle.trim()}
                                            className="flex-1 sm:flex-none text-xs bg-slate-800 text-white px-4 py-1.5 rounded font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                        >
                                            追加
                                        </button>
                                        <button
                                            onClick={() => setAddingTaskProjectId(null)}
                                            className="flex-1 sm:flex-none text-xs bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        setAddingTaskProjectId(project.id);
                                        setNewTaskTitle('');
                                        setNewTaskPoints(10);
                                        setNewTaskAssignee(null);
                                        setNewTaskCategory('Frontend');
                                    }}
                                    className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors group"
                                >
                                    <Plus size={16} className="text-slate-400 group-hover:text-indigo-500" />
                                    新規タスクを追加
                                </div>
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
