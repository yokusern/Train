export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
    id: number;
    name: string;
    avatar: string;
    points: number;
    pendingPoints: number; // 承認待ちポイント
    rank: string;
    role: Role;
    skillScore?: Record<string, number>; // スキルスコア（カテゴリごとの累計）
}

export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    points: number;
    assigneeId: number | null;
    deadline: string;
    category?: string; // e.g. 'Engineering', 'Design', 'Planning'
    createdBy?: string;
}

export interface Project {
    id: number;
    name: string;
    icon: string;
    tasks: Task[];
    createdBy?: string;
}

export interface Activity {
    id: number;
    user: string;
    action: string;
    target: string;
    points: string;
    time: string;
}

export interface ChatMessage {
    id: number;
    user: string;
    avatar: string;
    text: string;
    time: string;
}
