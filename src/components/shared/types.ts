export type Role = 'MEMBER' | 'ADMIN';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    points: number;
    pendingPoints: number; // 承認待ちポイント
    rank: string;
    role: Role;
    skillScore?: Record<string, number>; // スキルスコア（カテゴリごとの累計）
    currentTeamId: number | null;
    joinedTeamIds: number[];
}

export interface Team {
    id: number;
    name: string;
    joinCode: string;
    adminUserId: number;
}

export interface Task {
    id: number;
    teamId?: number;
    title: string;
    status: TaskStatus;
    points: number;
    assigneeId: number | null;
    deadline?: string; // ISO date string e.g. "2025-03-31"
    category?: string; // e.g. 'Engineering', 'Design', 'Planning'
    createdBy?: string;
    createdByUserId?: number;
    createdAt?: number;
}

export interface Project {
    id: number;
    teamId?: number;
    name: string;
    icon: string;
    tasks: Task[];
    createdBy?: string;
    createdByUserId?: number;
    createdAt?: number;
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

/** チームに所属するメンバーの情報（teamId に紐付いたロール） */
export interface TeamMember {
    userId: number;
    teamId: number;
    role: Role;
    joinedAt: number;
}

/** ポイント付与の履歴エントリ */
export interface PointHistory {
    id: number;
    teamId: number;
    userId: number;
    userName: string;
    taskId: number;
    taskTitle: string;
    points: number;
    awardedAt: number; // timestamp
}
