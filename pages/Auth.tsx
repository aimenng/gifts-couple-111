import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { useApp } from '../context';
import { ArrowLeft, Mail, Lock, Check, AlertCircle, Eye, EyeOff, Shield, LogOut } from 'lucide-react';

interface AuthPageProps {
    onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const { currentUser, login, register, logout, isEmailTaken } = useAuth();
    const { inviteCode } = useApp();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('请填写邮箱和密码');
            return;
        }

        const success = login(email, password);
        if (success) {
            setSuccess('登录成功！正在同步数据...');
            setTimeout(() => {
                onBack();
            }, 1000);
        } else {
            setError('邮箱或密码错误');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !password) {
            setError('请填写所有必填项');
            return;
        }

        if (password.length < 6) {
            setError('密码长度至少需要6位');
            return;
        }

        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (isEmailTaken(email)) {
            setError('该邮箱已被注册');
            return;
        }

        const success = register(email, password);
        if (success) {
            setSuccess('账号注册成功！当前邀请码已绑定。');
            setTimeout(() => {
                // Stay on page or valid success state?
                // Maybe redirect after short delay?
                // Stay to show account info
            }, 1500);
        } else {
            setError('注册失败，请重试');
        }
    };

    const handleLogout = () => {
        if (confirm('确定要退出登录吗？本地数据将保留，但不再同步云端。')) {
            logout();
            resetForm();
        }
    };

    // If logged in, show Account Management
    if (currentUser) {
        return (
            <div className="flex flex-col h-full w-full bg-[var(--eye-bg-primary)] px-4 pt-safe-top animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center gap-4 py-4 mb-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-[var(--eye-bg-secondary)] transition-colors text-[var(--eye-text-primary)]"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-[var(--eye-text-primary)]">账号与安全</h1>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--eye-text-primary)]">已登录</h2>
                    <p className="text-[var(--eye-text-secondary)] mt-1">{currentUser.email}</p>
                </div>

                <div className="w-full space-y-4">
                    <div className="bg-[var(--eye-bg-secondary)] rounded-2xl p-4 border border-[var(--eye-border)]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-[var(--eye-text-secondary)]">绑定邀请码</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">已同步</span>
                        </div>
                        <p className="text-lg font-mono font-bold tracking-widest text-[var(--eye-text-primary)]">
                            {currentUser.invitationCode}
                        </p>
                    </div>

                    <div className="bg-[var(--eye-bg-secondary)] rounded-2xl p-4 border border-[var(--eye-border)]">
                        <h3 className="text-[var(--eye-text-primary)] font-medium mb-2">账号信息</h3>
                        <div className="flex justify-between items-center py-2 border-b border-[var(--eye-border)] last:border-0">
                            <span className="text-sm text-[var(--eye-text-secondary)]">注册时间</span>
                            <span className="text-sm text-[var(--eye-text-primary)]">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[var(--eye-border)] last:border-0">
                            <span className="text-sm text-[var(--eye-text-secondary)]">安全等级</span>
                            <span className="text-sm text-green-500 font-medium">高</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full h-12 mt-8 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        退出登录
                    </button>
                </div>
            </div>
        );
    }

    // Not logged in - Show Login/Register
    return (
        <div className="flex flex-col h-full w-full bg-[var(--eye-bg-primary)] px-4 pt-safe-top animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-4 py-4 mb-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-[var(--eye-bg-secondary)] transition-colors text-[var(--eye-text-primary)]"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 flex justify-center bg-[var(--eye-bg-secondary)] p-1 rounded-xl">
                    <button
                        onClick={() => { setActiveTab('login'); resetForm(); }}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'login' ? 'bg-white dark:bg-[#344026] text-primary shadow-sm' : 'text-[var(--eye-text-secondary)]'}`}
                    >
                        登录
                    </button>
                    <button
                        onClick={() => { setActiveTab('register'); resetForm(); }}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'register' ? 'bg-white dark:bg-[#344026] text-primary shadow-sm' : 'text-[var(--eye-text-secondary)]'}`}
                    >
                        注册
                    </button>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex flex-col pt-8">
                <h2 className="text-2xl font-bold text-[var(--eye-text-primary)] mb-2">
                    {activeTab === 'register' ? '创建账号' : '欢迎回来'}
                </h2>
                <p className="text-[var(--eye-text-secondary)] mb-8">
                    {activeTab === 'register' ? '注册账号以永久保存您的回忆和设置' : '登录以恢复您的云端数据和绑定信息'}
                </p>

                {error && (
                    <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-50 text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-green-50 text-green-600 text-sm">
                        <Check className="w-5 h-5 shrink-0" />
                        {success}
                    </div>
                )}

                <form onSubmit={activeTab === 'register' ? handleRegister : handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--eye-text-secondary)] ml-1">邮箱地址</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[var(--eye-text-secondary)]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="例如：example@email.com"
                                className="w-full h-12 rounded-xl bg-[var(--eye-bg-secondary)] border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-black/20 focus:ring-0 pl-10 text-[var(--eye-text-primary)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--eye-text-secondary)] ml-1">密码</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[var(--eye-text-secondary)]" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="至少6位字符"
                                className="w-full h-12 rounded-xl bg-[var(--eye-bg-secondary)] border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-black/20 focus:ring-0 pl-10 pr-10 text-[var(--eye-text-primary)] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-[var(--eye-text-secondary)] hover:text-[var(--eye-text-primary)]"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'register' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[var(--eye-text-secondary)] ml-1">确认密码</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[var(--eye-text-secondary)]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="再次输入密码"
                                    className="w-full h-12 rounded-xl bg-[var(--eye-bg-secondary)] border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-black/20 focus:ring-0 pl-10 text-[var(--eye-text-primary)] transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all hover:bg-[#7a8a4b]"
                        >
                            {activeTab === 'register' ? '立即注册' : '登录'}
                        </button>
                    </div>
                </form>

                {activeTab === 'register' && (
                    <p className="text-xs text-[var(--eye-text-secondary)] text-center mt-6 px-4">
                        注册即代表您同意我们的 <span className="text-primary underline cursor-pointer">服务条款</span> 和 <span className="text-primary underline cursor-pointer">隐私政策</span>
                    </p>
                )}
            </div>
        </div>
    );
};
