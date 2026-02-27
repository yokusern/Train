import React from 'react';
import { User } from './types';
import { Hexagon, LogOut, User as UserIcon, Medal } from 'lucide-react';

interface HeaderProps {
    currentUser: User;
    isAdmin: boolean;
    onSwitchRole?: () => void;
}

export default function Header({ currentUser, isAdmin, onSwitchRole }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="flex items-center justify-center bg-slate-900 text-white w-7 h-7 rounded-lg shadow-sm">
                    <Hexagon size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-900 tracking-tight">Train</span>
                <span className="text-slate-300">/</span>
                <span>{isAdmin ? '管理者ダッシュボード' : 'マイワークスペース'}</span>
            </div>
            <div className="flex items-center gap-4">
                {onSwitchRole && (
                    <button
                        onClick={onSwitchRole}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline mr-2"
                    >
                        ユーザー切替
                    </button>
                )}
                <div className="flex items-center gap-2 bg-white px-1.5 py-1.5 rounded-full border border-slate-200 shadow-sm pr-4">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[10px] flex items-center justify-center font-bold shadow-inner">
                        {currentUser.avatar}
                    </span>
                    <div className="flex flex-col text-right leading-none">
                        {isAdmin && (
                            <span className="text-sm font-bold text-slate-900">
                                {currentUser.points} <span className="text-[10px] text-slate-400 font-medium">Pt</span>
                            </span>
                        )}
                        {!isAdmin && currentUser.pendingPoints > 0 && (
                            <span className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                +{currentUser.pendingPoints} 承認待ち
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full ml-1">
                        <Medal size={12} strokeWidth={2.5} className="text-yellow-600" />
                        <span className="text-[10px] font-bold tracking-wide uppercase">{currentUser.rank}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
