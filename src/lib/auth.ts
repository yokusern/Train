import { clearAppStorage, setStorageItem, getStorageItem, removeStorageItem } from './storage';

/**
 * ログイン（チーム参加）時の認証情報セット
 */
export function login(teamCode: string, role: string): void {
    if (typeof window === 'undefined') return;
    setStorageItem('current_team_code', teamCode);
    setStorageItem('user_role', role);
    setStorageItem('is_authenticated', 'true');
}

/**
 * ログアウト一括処理
 */
export async function logout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        // 1. 全ての 'train_' プレフィックス付きデータを削除
        clearAppStorage();

        // 2. 明示的な削除（指定されたキーを含む）
        ['current_team_code', 'user_role', 'is_authenticated', 'user'].forEach(key => {
            removeStorageItem(key);
        });

        // 3. トップページへ強制遷移（Stateリセットのため）
        window.location.href = '/';

    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/';
    }
}

/**
 * 認証状態のチェック（ガード用）
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const code = getStorageItem('current_team_code');
    const auth = getStorageItem('is_authenticated');
    return !!code && auth === 'true';
}

