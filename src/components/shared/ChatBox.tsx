import React, { useState } from 'react';
import { ChatMessage, User } from './types';

interface ChatBoxProps {
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (text: string) => void;
}

export default function ChatBox({ messages, currentUser, onSendMessage }: ChatBoxProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="mt-10 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 font-bold text-slate-800 flex items-center gap-2">
                <span>💬</span> チームチャット＆連絡事項
            </div>
            <div className="p-5 space-y-5 max-h-72 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                        {msg.avatar === '🤖' ? (
                            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-500 shadow-sm text-sm">
                                🤖
                            </div>
                        ) : (
                            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                                {msg.avatar}
                            </div>
                        )}
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-sm text-slate-900">{msg.user}</span>
                                <span className="text-xs text-slate-400">{msg.time}</span>
                            </div>
                            <p className={`text - sm mt - 0.5 inline - block px - 3 py - 2 rounded - 2xl rounded - tl - none border ${msg.avatar === '🤖' ? 'bg-blue-50/50 border-blue-100 text-blue-800' : 'bg-slate-50 border-slate-100 text-slate-700'} `}>
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`${currentUser.name}としてメッセージを送信...`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    送信
                </button>
            </form>
        </div>
    );
}
