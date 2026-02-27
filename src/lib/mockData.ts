import { User, Project, Activity, ChatMessage, TaskStatus } from '../components/shared/types';

export const initialTeam: User[] = [
    {
        id: 1, name: 'Alex Carter', avatar: 'AC', points: 1250, pendingPoints: 0, rank: 'Senior', role: 'ADMIN',
        skillScore: { 'UI/UX': 800, 'Frontend': 500, 'Backend': 1200, 'Planning': 900, 'Review': 1500 }
    },
    {
        id: 2, name: 'Sarah Jenkins', avatar: 'SJ', points: 2100, pendingPoints: 30, rank: 'Lead', role: 'MEMBER',
        skillScore: { 'UI/UX': 1600, 'Frontend': 2200, 'Backend': 400, 'Planning': 600, 'Review': 300 }
    },
    {
        id: 3, name: 'Mike Ross', avatar: 'MR', points: 850, pendingPoints: 0, rank: 'Mid', role: 'MEMBER',
        skillScore: { 'UI/UX': 200, 'Frontend': 700, 'Backend': 1800, 'Planning': 200, 'Review': 100 }
    },
];

const today = new Date();
const _addDays = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const _addHours = (hours: number) => new Date(today.getTime() + hours * 60 * 60 * 1000).toISOString();

export const initialProjects: Project[] = [
    {
        id: 101,
        name: 'Website Redesign 2026',
        icon: 'layout', // Will map to a Lucide icon name internally
        tasks: [
            { id: 1, title: 'Design System Revamp - Typography & Colors', status: 'done', points: 50, assigneeId: 2, deadline: _addDays(1), category: 'UI/UX' },
            { id: 2, title: 'Implement Responsive Navigation Header', status: 'in_review', points: 30, assigneeId: 2, deadline: _addDays(0), category: 'Frontend' },
            { id: 3, title: 'Optimize Mobile Layout Web Core Vitals', status: 'todo', points: 80, assigneeId: null, deadline: _addDays(7), category: 'Frontend' },
        ]
    },
    {
        id: 102,
        name: 'API v2 Migration',
        icon: 'server',
        tasks: [
            { id: 4, title: 'Provision PostgreSQL RDS Instance', status: 'done', points: 100, assigneeId: 3, deadline: _addDays(-1), category: 'Backend' },
            { id: 5, title: 'Develop JWT Authentication Endpoints', status: 'in_progress', points: 60, assigneeId: 3, deadline: _addDays(3), category: 'Backend' },
        ]
    }
];

export const initialActivities: Activity[] = [
    { id: 1, user: 'Sarah Jenkins', action: 'marked as ready for review', target: 'Implement Responsive Navigation Header', points: '+30 (Pending)', time: _addHours(-0.1) },
    { id: 2, user: 'Alex Carter', action: 'approved', target: 'Provision PostgreSQL RDS Instance', points: '+100', time: _addHours(-24) },
];

export const initialChatMessages: ChatMessage[] = [
    { id: 1, user: 'Sarah Jenkins', avatar: 'SJ', text: 'I just finished the header implementation. Can someone review the PR?', time: _addHours(-1) },
    { id: 2, user: 'Alex Carter', avatar: 'AC', text: 'Looking at it now!', time: _addHours(-0.8) },
];
