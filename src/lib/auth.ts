'use client';

import { clearAppStorage } from './storage';

/**
 * ログアウト一括処理
 * ローカルストレージ内の全アプリデータを削除し、トップページへ強制遷移させます。
 */
export async function logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        // 1. 全ての 'train_' プレフィックス付きデータを削除
        clearAppStorage();

        // 2. 追加で明示的な削除（互換性のため）
        ['train_user', 'train_tasks', 'train_role', 'train_state_v3', 'train_state_v2'].forEach(key => {
            window.localStorage.removeItem(key);
        });

        // 3. State を初期化し、トップページへリダイレクト
        // 理由: location.href を使うことで React の State も完全にリフレッシュされる
        window.location.href = '/';

    } catch (error) {
        console.error('Logout failed:', error);
        // 失敗しても強制的にリダイレクト
        window.location.href = '/';
    }
}

/**
 * ログイン状態のチェック（ガード用）
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const user = window.localStorage.getItem('train_user') || window.localStorage.getItem('train_train_user');
    return !!user;
}
