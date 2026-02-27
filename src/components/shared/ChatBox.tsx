'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User as UserIcon, Bot, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatBoxProps {
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (text: string) => void;
    onAskAI: (query: string) => void;
    isAILoading: boolean;
}

export default function ChatBox({ messages, currentUser, onSendMessage, onAskAI, isAILoading }: ChatBoxProps) {
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAILoading]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        if (inputText.startsWith('/ai ')) {
            onAskAI(inputText.replace('/ai ', ''));
        } else {
            onSendMessage(inputText);
        }
        setInputText('');
    };

    return (
        <div className="flex flex-col h-[500px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-premium overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Team Chat</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> AI Enabled
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isMe = msg.user === currentUser.name;
                        const isAI = msg.user === 'Train AI' || msg.user === 'System Notification' || msg.avatar === '🤖';

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex flex-col",
                                    isMe ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    isMe ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs border shadow-sm",
                                        isAI ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                                    )}>
                                        {isAI ? <Bot className="w-4 h-4" /> : msg.avatar}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={cn(
                                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                            isMe
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : isAI
                                                    ? "glass border-indigo-200 dark:border-indigo-500/20 text-slate-800 dark:text-slate-100 rounded-tl-none"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-white/5"
                                        )}>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                        <p className={cn(
                                            "text-[10px] font-medium text-slate-400 px-1",
                                            isMe ? "text-right" : "text-left"
                                        )}>
                                            {msg.user} • {msg.time}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {isAILoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="glass px-4 py-3 rounded-2xl rounded-tl-none border-indigo-200 dark:border-indigo-500/20">
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-white/5">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Type a message or use /ai to ask..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <button
                        onClick={() => setInputText('/ai ')}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                        <Sparkles className="w-3 h-3" /> ASK AI
                    </button>
                </div>
            </div>
        </div>
    );
}
