'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Train, ShieldCheck, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-indigo-500/20 shadow-xl"
          >
            <Train className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">Welcome to Train</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Accelerate your team's contribution and growth.</p>
        </div>

        <div className="space-y-4">
          <Link href="/admin">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">Admin Portal</h3>
                  <p className="text-slate-500 text-xs">Manage projects, teams & points.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </motion.div>
          </Link>

          <Link href="/dashboard">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <UserIcon className="text-purple-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">Contributor Space</h3>
                  <p className="text-slate-500 text-xs">Track tasks, rank up & collaborate.</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </motion.div>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Powered by Gemini AI
        </div>
      </motion.div>
    </div>
  );
}
