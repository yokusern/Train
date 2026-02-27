'use client';

import type { Project, Task, TaskStatus } from '@/components/shared/types';

const STORAGE_KEY = 'train_projects';

export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export function addProject(projects: Project[], name: string, icon: string, createdBy: string): Project[] {
  const newProject: Project = {
    id: Date.now(),
    name,
    icon,
    tasks: [],
    createdBy,
  };
  const next = [...projects, newProject];
  saveProjects(next);
  return next;
}

export function addTask(
  projects: Project[],
  projectId: number,
  title: string,
  points: number,
  assigneeId: number | null,
  category: string | undefined,
  createdBy: string,
): Project[] {
  const next = projects.map((p) =>
    p.id !== projectId
      ? p
      : {
          ...p,
          tasks: [
            ...p.tasks,
            {
              id: Date.now(),
              title,
              status: 'todo',
              points,
              assigneeId,
              deadline: '',
              category,
              createdBy,
            } satisfies Task,
          ],
        },
  );
  saveProjects(next);
  return next;
}

export function updateTaskStatus(
  projects: Project[],
  projectId: number,
  taskId: number,
  status: TaskStatus,
  assigneeId: number | null,
): Project[] {
  const next = projects.map((p) =>
    p.id !== projectId
      ? p
      : {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  status,
                  assigneeId: assigneeId ?? t.assigneeId,
                },
          ),
        },
  );
  saveProjects(next);
  return next;
}

