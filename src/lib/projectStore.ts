'use client';

import type { Project, Task, TaskStatus } from '@/components/shared/types';
import { loadState, saveState, TrainState } from './trainState';

const STORAGE_KEY = 'train_state_v2';

export function loadProjects(): Project[] {
  const state = loadState();
  return state.projects || [];
}

export function saveProjects(projects: Project[]) {
  const state = loadState();
  saveState({ ...state, projects });
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

