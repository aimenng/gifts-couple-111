import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from './types';
import { useApp } from './context';

interface AuthContextType {
    currentUser: User | null;
    partner: User | null;
    register: (email: string, password: string) => boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
    notifications: Notification[];
    addNotification: (title: string, message: string, type?: 'system' | 'interaction') => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;
    unreadCount: number;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'system' | 'interaction';
    read: boolean;
    createdAt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
    USERS: 'gifts_auth_users',
    CURRENT_USER_ID: 'gifts_auth_current_user_id',
    NOTIFICATIONS: 'gifts_auth_notifications',
};

// Helper to safely parse JSON from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        return fallback;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { inviteCode, connect } = useApp();

    const [users, setUsers] = useState<User[]>(() =>
        loadFromStorage(STORAGE_KEYS.USERS, [])
    );

    const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
        loadFromStorage(STORAGE_KEYS.CURRENT_USER_ID, null)
    );

    const [allNotifications, setAllNotifications] = useState<Notification[]>(() =>
        loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, [])
    );

    const currentUser = users.find(u => u.id === currentUserId) || null;

    // Filter notifications for current user
    const notifications = React.useMemo(() =>
        allNotifications.filter(n => n.userId === currentUserId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Newest first
        [allNotifications, currentUserId]
    );

    const unreadCount = React.useMemo(() =>
        notifications.filter(n => !n.read).length,
        [notifications]
    );

    // Find partner based on invitation code
    const partner = users.find(u =>
        u.id !== currentUserId &&
        u.invitationCode === currentUser?.invitationCode
    ) || null;

    // Persist state changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.USERS, users);
    }, [users]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    }, [currentUserId]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    }, [allNotifications]);

    const addNotification = (title: string, message: string, type: 'system' | 'interaction' = 'system') => {
        if (!currentUserId) return;
        const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: currentUserId,
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };
        setAllNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setAllNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const clearNotifications = () => {
        if (!currentUserId) return;
        setAllNotifications(prev => prev.filter(n => n.userId !== currentUserId));
    };

    const generateInvitationCode = () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `GIFT-${result}`;
    };

    const isEmailTaken = (email: string) => {
        return users.some(u => u.email.toLowerCase() === email.toLowerCase());
    };

    const register = (email: string, password: string): boolean => {
        if (isEmailTaken(email)) return false;

        const userInviteCode = inviteCode || generateInvitationCode();

        const newUser: User = {
            id: Date.now().toString(),
            email,
            passwordHash: password,
            invitationCode: userInviteCode,
            createdAt: new Date().toISOString(),
            name: email.split('@')[0],
            gender: 'male' // Default
        };

        setUsers(prev => [...prev, newUser]);
        setCurrentUserId(newUser.id);

        // Add welcome notification - using direct update to avoid closure staleness if we used addNotification immediately (though state updates are batched, better to be safe)
        const welcomeNotification: Notification = {
            id: Date.now().toString() + 'welcome',
            userId: newUser.id,
            title: '注册成功',
            message: `欢迎加入 Gifts！您的账号 ${email} 已创建成功。您的邀请码是 ${userInviteCode}，快去邀请您的伴侣吧！`,
            type: 'system',
            read: false,
            createdAt: new Date().toISOString()
        };
        setAllNotifications(prev => [welcomeNotification, ...prev]);

        if (!inviteCode) {
            connect(userInviteCode);
        }

        return true;
    };

    const login = (email: string, password: string): boolean => {
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
        );

        if (user) {
            setCurrentUserId(user.id);
            if (user.invitationCode && user.invitationCode !== inviteCode) {
                // Determine if we should treat this as a new connection for notification
                // For simplified logic, if local inviteCode update happens, we can assume sync
                connect(user.invitationCode);
            }

            // ADD LOGIN NOTIFICATION
            const loginNotification: Notification = {
                id: Date.now().toString() + 'login',
                userId: user.id,
                title: '登录成功',
                message: `欢迎回来，${user.name || user.email}！希望您今天拥有美好的一天。`,
                type: 'system',
                read: false,
                createdAt: new Date().toISOString()
            };
            setAllNotifications(prev => [loginNotification, ...prev]);

            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUserId(null);
    };

    const updateProfile = (updates: Partial<User>) => {
        if (!currentUserId) return;

        setUsers(prevUsers => prevUsers.map(u =>
            u.id === currentUserId ? { ...u, ...updates } : u
        ));
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            partner,
            register,
            login,
            logout,
            updateProfile,
            users,
            isEmailTaken,
            notifications,
            addNotification,
            markAsRead,
            clearNotifications,
            unreadCount
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
