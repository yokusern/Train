'use client';

import React, { useState } from 'react';
import { Project, Task, TaskStatus, User } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    User as UserIcon,
    MoreVertical,
    Calendar,
    Tag,
    Award,
    Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectListProps {
    projects: Project[];
    isAdmin: boolean;
    currentUser: User;
    team: User[];
    onTaskAction: (projectId: number, taskId: number, currentStatus: TaskStatus, points: number, currentAssignee: number | null, category?: string) => void;
    onCreateTask: (projectId: number, title: string, points: number, assigneeId: number | null, category?: string) => void;
}

export default function ProjectList({ projects, isAdmin, currentUser, team, onTaskAction, onCreateTask }: ProjectListProps) {
    const [expandedProjects, setExpandedProjects] = useState<number[]>(projects.map(p => p.id));
    const [isAddingTask, setIsAddingTask] = useState<number | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const toggleProject = (id: number) => {
        setExpandedProjects(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />;
            case 'in_review': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />;
        }
    };

    const getStatusLabel = (status: TaskStatus) => {
        switch (status) {
            case 'done': return '完了済';
            case 'in_progress': return '進行中';
            case 'in_review': return '承認待';
            default: return '未着手';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'done': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'in_progress': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            case 'in_review': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-white/5';
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-premium"
                    >
                        {/* Project Header */}
                        <div
                            onClick={() => toggleProject(project.id)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <span className="text-xl">{project.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{project.name}</h3>
                                    <p className="text-xs text-slate-500">{project.tasks.length} 個のタスク</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsAddingTask(project.id);
                                        }}
                                        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                )}
                                {expandedProjects.includes(project.id) ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                            </div>
                        </div>

                        {/* Task List */}
                        <AnimatePresence>
                            {expandedProjects.includes(project.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-100 dark:border-white/5"
                                >
                                    <div className="p-2 space-y-1">
                                        {project.tasks.map((task) => {
                                            const assignee = team.find(u => u.id === task.assigneeId);
                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    layout
                                                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <button
                                                            onClick={() => onTaskAction(project.id, task.id, task.status, task.points, task.assigneeId, task.category)}
                                                            className="flex-shrink-0"
                                                        >
                                                            {getStatusIcon(task.status)}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "text-sm font-semibold truncate",
                                                                task.status === 'done' ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                                                            )}>
                                                                {task.title}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                {task.category && (
                                                                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                                                        <Tag className="w-3 h-3" /> {task.category}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                                                    <Award className="w-3 h-3" /> {task.points} pts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "hidden md:block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                            getStatusColor(task.status)
                                                        )}>
                                                            {getStatusLabel(task.status)}
                                                        </div>

                                                        {assignee ? (
                                                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400" title={assignee.name}>
                                                                {assignee.avatar}
                                                            </div>
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-300">
                                                                <UserIcon className="w-3 h-3" />
                                                            </div>
                                                        )}

                                                        {(!isAdmin && task.status !== 'done' && task.status !== 'in_review') && (
                                                            <button
                                                                onClick={() => onTaskAction(project.id, task.id, task.status, task.points, task.assigneeId)}
                                                                className="p-1 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                                                            >
                                                                <Play className="w-3 h-3 fill-current" />
                                                                {task.status === 'todo' ? '開始' : '完了報告'}
                                                            </button>
                                                        )}

                                                        {isAdmin && task.status === 'in_review' && (
                                                            <button
                                                                onClick={() => onTaskAction(project.id, task.id, task.status, task.points, task.assigneeId)}
                                                                className="p-1 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                                                            >
                                                                承認する
                                                            </button>
                                                        )}

                                                        <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {isAdmin && isAddingTask === project.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="p-3"
                                            >
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="タスク名を入力してEnter..."
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                                                    value={newTaskTitle}
                                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newTaskTitle.trim()) {
                                                            onCreateTask(project.id, newTaskTitle, 50, null);
                                                            setNewTaskTitle('');
                                                            setIsAddingTask(null);
                                                        }
                                                        if (e.key === 'Escape') setIsAddingTask(null);
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
