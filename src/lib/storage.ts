'use client';

/**
 * Train専用のストレージユーティリティ
 * データの難読化（Base64）と、プレフィックスに基づいた一括操作を提供します。
 */

const PREFIX = 'train_';
const PERSISTENT_PREFIX = 'train_ext_'; // ログアウトしても消えない設定用

/**
 * データをBase64エンコードして保存
 */
export function setStorageItem(key: string, value: any, persistent = false): void {
    if (typeof window === 'undefined') return;
    try {
        const jsonString = JSON.stringify(value);
        const encoded = btoa(encodeURIComponent(jsonString));
        const prefix = persistent ? PERSISTENT_PREFIX : PREFIX;
        window.localStorage.setItem(key.startsWith(prefix) ? key : `${prefix}${key}`, encoded);
    } catch (e) {
        console.error('Storage save error:', e);
    }
}

/**
 * データを復号して取得
 */
export function getStorageItem<T>(key: string, persistent = false): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const prefix = persistent ? PERSISTENT_PREFIX : PREFIX;
        const fullKey = key.startsWith(prefix) ? key : `${prefix}${key}`;
        const encoded = window.localStorage.getItem(fullKey);
        if (!encoded) return null;
        const decoded = decodeURIComponent(atob(encoded));
        return JSON.parse(decoded) as T;
    } catch (e) {
        // 互換性のため、平文での取得も試行
        try {
            const prefix = persistent ? PERSISTENT_PREFIX : PREFIX;
            const fullKey = key.startsWith(prefix) ? key : `${prefix}${key}`;
            const raw = window.localStorage.getItem(fullKey);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }
}

/**
 * 特定のキーを削除
 */
export function removeStorageItem(key: string, persistent = false): void {
    if (typeof window === 'undefined') return;
    const prefix = persistent ? PERSISTENT_PREFIX : PREFIX;
    const fullKey = key.startsWith(prefix) ? key : `${prefix}${key}`;
    window.localStorage.removeItem(fullKey);
}

/**
 * アプリ関連のセッションデータを削除（永続設定は残す）
 */
export function clearAppStorage(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        // 'train_' (SESSION) は削除し、 'train_ext_' (PERSISTENT) は残す
        if (key && key.startsWith(PREFIX) && !key.startsWith(PERSISTENT_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
}
