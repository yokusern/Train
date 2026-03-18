'use client';

import type { User, Project, Task, TaskStatus, Role, TeamMember, PointHistory } from '@/components/shared/types';

import { getStorageItem, setStorageItem } from './storage';

// ─────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────

export { logout, isAuthenticated } from './auth';

export type Team = {
  id: number;
  name: string;
  joinCode: string; // 6桁の英数字大文字 e.g. "A1B2C3"
  adminUserId: number;
};

export type TrainState = {
  user: User | null;
  teams: Team[];
  teamMembers: TeamMember[]; // チームごとのメンバー＆ロール
  projects: Project[];
  pointHistory: PointHistory[]; // ポイント付与履歴
};

// ─────────────────────────────────────────────
// ストレージキー
// ─────────────────────────────────────────────

const STORAGE_KEY = 'state_v3'; // 'train_' prefix is handled by storage.ts

const emptyState: TrainState = {
  user: null,
  teams: [],
  teamMembers: [],
  projects: [],
  pointHistory: [],
};

// ─────────────────────────────────────────────
// 永続化
// ─────────────────────────────────────────────

export function loadState(): TrainState {
  if (typeof window === 'undefined') return emptyState;
  try {
    const parsed = getStorageItem<any>(STORAGE_KEY, true); // true = persistent (train_ext_)
    if (!parsed || typeof parsed !== 'object') return emptyState;
    return {
      user: parsed.user ?? null,
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      pointHistory: Array.isArray(parsed.pointHistory) ? parsed.pointHistory : [],
    } satisfies TrainState;
  } catch {
    return emptyState;
  }
}

export function saveState(state: TrainState) {
  if (typeof window === 'undefined') return;
  setStorageItem(STORAGE_KEY, state, true); // true = persistent
}



// ─────────────────────────────────────────────
// ユーザー作成
// ─────────────────────────────────────────────

export function createUser(name: string): User {
  return {
    id: Date.now(),
    name,
    email: `${name.toLowerCase()}@example.com`,
    avatar: name.slice(0, 2).toUpperCase(),
    points: 0,
    pendingPoints: 0,
    rank: 'Rookie',
    role: 'MEMBER',
    currentTeamId: null,
    joinedTeamIds: [],
  };
}

// ─────────────────────────────────────────────
// 参加コード生成（6桁の英数字大文字）
// ─────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字(0,O,1,I)を除外

export function generateJoinCode(existing: Set<string>): string {
  for (let i = 0; i < 100; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    if (!existing.has(code)) return code;
  }
  // フォールバック（衝突が続いた場合）
  return `T${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

// ─────────────────────────────────────────────
// チーム操作
// ─────────────────────────────────────────────

export function createTeam(state: TrainState, teamName: string): TrainState {
  if (!state.user) return state;
  const existing = new Set(state.teams.map((t) => t.joinCode));
  const team: Team = {
    id: Date.now(),
    name: teamName,
    joinCode: generateJoinCode(existing),
    adminUserId: state.user.id,
  };

  // チーム作成者を Admin として teamMembers に登録
  const newMember: TeamMember = {
    userId: state.user.id,
    teamId: team.id,
    role: 'ADMIN',
    joinedAt: Date.now(),
  };

  const nextUser: User = {
    ...state.user,
    joinedTeamIds: [...new Set([...state.user.joinedTeamIds, team.id])],
    currentTeamId: team.id,
    role: 'ADMIN', // 作成者はADMIN
  };

  const next: TrainState = {
    ...state,
    user: nextUser,
    teams: [...state.teams, team],
    teamMembers: [...state.teamMembers, newMember],
  };
  saveState(next);
  return next;
}

export function joinTeamByCode(
  state: TrainState,
  joinCode: string,
): { state: TrainState; error?: string } {
  if (!state.user) return { state, error: 'not_logged_in' };
  const code = joinCode.trim().toUpperCase();
  const team = state.teams.find((t) => t.joinCode === code);
  if (!team) return { state, error: 'invalid_code' };

  // 既に参加済みの場合はそのまま切り替えるだけ
  const alreadyMember = state.teamMembers.some(
    (m) => m.userId === state.user!.id && m.teamId === team.id,
  );

  const newMember: TeamMember = alreadyMember
    ? null!
    : {
      userId: state.user.id,
      teamId: team.id,
      role: 'MEMBER',
      joinedAt: Date.now(),
    };

  // チームの admin かどうかを判定してロールを設定
  const isAdmin = team.adminUserId === state.user.id;

  const nextUser: User = {
    ...state.user,
    joinedTeamIds: [...new Set([...state.user.joinedTeamIds, team.id])],
    currentTeamId: team.id,
    role: isAdmin ? 'ADMIN' : 'MEMBER',
  };

  const next: TrainState = {
    ...state,
    user: nextUser,
    teamMembers: alreadyMember
      ? state.teamMembers
      : [...state.teamMembers, newMember],
  };
  saveState(next);
  return { state: next };
}

// ─────────────────────────────────────────────
// チーム切り替え
// ─────────────────────────────────────────────

export function setCurrentTeam(state: TrainState, teamId: number): TrainState {
  if (!state.user) return state;
  if (!state.user.joinedTeamIds.includes(teamId)) return state;

  // 切り替え先チームでのロールを取得
  const memberEntry = state.teamMembers.find(
    (m) => m.userId === state.user!.id && m.teamId === teamId,
  );
  const team = state.teams.find((t) => t.id === teamId);
  const isAdmin =
    team?.adminUserId === state.user.id || memberEntry?.role === 'ADMIN';

  const next: TrainState = {
    ...state,
    user: {
      ...state.user,
      currentTeamId: teamId,
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    },
  };
  saveState(next);
  return next;
}

// ─────────────────────────────────────────────
// ヘルパー
// ─────────────────────────────────────────────

export function isTeamAdmin(state: TrainState, teamId: number): boolean {
  const u = state.user;
  const t = state.teams.find((x) => x.id === teamId);
  if (!u || !t) return false;
  if (t.adminUserId === u.id) return true;
  const entry = state.teamMembers.find(
    (m) => m.userId === u.id && m.teamId === teamId,
  );
  return entry?.role === 'ADMIN';
}

export function getCurrentTeam(state: TrainState): Team | null {
  const id = state.user?.currentTeamId ?? null;
  if (!id) return null;
  return state.teams.find((t) => t.id === id) ?? null;
}

/** 現在のチームに所属するメンバー一覧（User情報付き） */
export function getTeamMembers(state: TrainState, teamId: number): User[] {
  const memberEntries = state.teamMembers.filter((m) => m.teamId === teamId);
  // 現在のユーザーのみ User 情報を持っているため、
  // 他メンバーは teamMembers から仮 User を生成する
  return memberEntries.map((m) => {
    if (state.user && state.user.id === m.userId) {
      return state.user;
    }
    // 他ユーザーの情報は localStorage に保存されていないため仮データを返す
    return {
      id: m.userId,
      name: `User#${m.userId}`,
      email: `user${m.userId}@example.com`,
      avatar: 'U',
      points: 0,
      pendingPoints: 0,
      rank: 'Member',
      role: m.role,
      currentTeamId: teamId,
      joinedTeamIds: [teamId],
    } satisfies User;
  });
}

export function projectsForCurrentTeam(state: TrainState): Project[] {
  const teamId = state.user?.currentTeamId;
  if (!teamId) return [];
  return state.projects.filter((p) => p.teamId === teamId);
}

/** 現在のチームの承認待ち（in_review）タスク件数 */
export function pendingReviewCount(state: TrainState): number {
  const teamId = state.user?.currentTeamId;
  if (!teamId) return 0;
  return state.projects
    .filter((p) => p.teamId === teamId)
    .flatMap((p) => p.tasks)
    .filter((t) => t.status === 'in_review').length;
}

export function userNameById(state: TrainState, userId: number): string {
  if (state.user?.id === userId) return state.user.name;
  return `User#${userId}`;
}

// ─────────────────────────────────────────────
// プロジェクト操作
// ─────────────────────────────────────────────

export function addProject(state: TrainState, name: string, icon: string): TrainState {
  const user = state.user;
  const teamId = user?.currentTeamId;
  if (!user || !teamId) return state;

  const project: Project = {
    id: Date.now(),
    teamId,
    name,
    icon,
    createdByUserId: user.id,
    createdBy: user.name,
    createdAt: Date.now(),
    tasks: [],
  };

  const next: TrainState = { ...state, projects: [...state.projects, project] };
  saveState(next);
  return next;
}

// ─────────────────────────────────────────────
// タスク操作
// ─────────────────────────────────────────────

export function addTaskToProject(
  state: TrainState,
  projectId: number,
  title: string,
  points: number,
  deadline?: string,
  category?: string,
): TrainState {
  const user = state.user;
  const teamId = user?.currentTeamId;
  if (!user || !teamId) return state;

  const nextProjects = state.projects.map((p) => {
    if (p.id !== projectId || p.teamId !== teamId) return p;
    const task: Task = {
      id: Date.now(),
      teamId,
      title,
      status: 'todo',
      points,
      assigneeId: null,
      deadline: deadline ?? '',
      category,
      createdByUserId: user.id,
      createdBy: user.name,
      createdAt: Date.now(),
    };
    return { ...p, tasks: [...p.tasks, task] };
  });

  const next: TrainState = { ...state, projects: nextProjects };
  saveState(next);
  return next;
}

export function updateTaskStatus(
  state: TrainState,
  projectId: number,
  taskId: number,
  status: TaskStatus,
): TrainState {
  const user = state.user;
  const teamId = user?.currentTeamId;
  if (!user || !teamId) return state;

  let newPointHistory = [...state.pointHistory];

  const nextProjects = state.projects.map((p) => {
    if (p.id !== projectId || p.teamId !== teamId) return p;
    return {
      ...p,
      tasks: p.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updated: Task = {
          ...t,
          status,
          assigneeId:
            status === 'in_progress' || status === 'in_review'
              ? user.id
              : t.assigneeId,
        };
        return updated;
      }),
    };
  });

  // 承認（done）時にポイント履歴を記録
  if (status === 'done') {
    const project = state.projects.find((p) => p.id === projectId);
    const task = project?.tasks.find((t) => t.id === taskId);
    if (task && task.assigneeId) {
      const assigneeName = userNameById(state, task.assigneeId);
      const historyEntry: PointHistory = {
        id: Date.now(),
        teamId,
        userId: task.assigneeId,
        userName: assigneeName,
        taskId: task.id,
        taskTitle: task.title,
        points: task.points,
        awardedAt: Date.now(),
      };
      newPointHistory = [...newPointHistory, historyEntry];
    }
  }

  const next: TrainState = {
    ...state,
    projects: nextProjects,
    pointHistory: newPointHistory,
  };
  saveState(next);
  return next;
}

/** 現在のチームのポイント履歴を取得 */
export function getTeamPointHistory(state: TrainState): PointHistory[] {
  const teamId = state.user?.currentTeamId;
  if (!teamId) return [];
  return state.pointHistory
    .filter((h) => h.teamId === teamId)
    .sort((a, b) => b.awardedAt - a.awardedAt);
}

/** チームメンバーごとのポイント集計 */
export function getTeamPointSummary(
  state: TrainState,
): { userId: number; userName: string; totalPoints: number; taskCount: number }[] {
  const history = getTeamPointHistory(state);
  const map = new Map<
    number,
    { userId: number; userName: string; totalPoints: number; taskCount: number }
  >();
  for (const h of history) {
    const existing = map.get(h.userId);
    if (existing) {
      existing.totalPoints += h.points;
      existing.taskCount += 1;
    } else {
      map.set(h.userId, {
        userId: h.userId,
        userName: h.userName,
        totalPoints: h.points,
        taskCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
}
