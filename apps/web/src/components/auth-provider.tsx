'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    UserData,
    getMe,
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
    setAccessToken,
    getAccessToken,
} from '@/lib/api';

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const token = getAccessToken();
            if (!token) {
                // Try silent refresh
                const result = await refreshToken();
                if (result) {
                    setAccessToken(result.accessToken);
                } else {
                    setLoading(false);
                    return;
                }
            }
            const res = await getMe();
            setUser(res.data);
        } catch {
            setAccessToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email: string, password: string) => {
        const res = await loginUser(email, password);
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
    };

    const register = async (email: string, password: string, name?: string) => {
        const res = await registerUser(email, password, name);
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
