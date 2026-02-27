import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚄</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Train へようこそ</h1>
          <p className="text-slate-500 text-sm mt-2">デモ環境のため、役割を選択してログインしてください。</p>
        </div>

        <div className="space-y-4">
          <Link href="/admin" className="block w-full p-4 rounded-xl border-2 border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                A
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">アレックスとしてログイン</div>
                <div className="text-xs text-slate-500">管理者 (ADMIN) / 全機能アクセス可能</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard" className="block w-full p-4 rounded-xl border-2 border-blue-500/20 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                S
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">サラとしてログイン</div>
                <div className="text-xs text-slate-500">メンバー (MEMBER) / 通常ダッシュボード</div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard" className="block w-full p-4 rounded-xl border-2 border-blue-500/20 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 transition-all group opacity-80">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                M
              </div>
              <div>
                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">マイクとしてログイン</div>
                <div className="text-xs text-slate-500">メンバー (MEMBER) / 通常ダッシュボード</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
