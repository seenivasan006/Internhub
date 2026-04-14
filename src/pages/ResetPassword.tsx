import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Lock, CheckCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import loginHero from '../assets/login-hero.png';

const translations: Record<string, any> = {
    English: {
        title: "Reset Password",
        desc: "Enter your new password below.",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        resetBtn: "Reset Password",
        resetting: "Resetting...",
        success: "Password reset successful!",
        successDesc: "Your password has been updated. You can now log in.",
        loginBtn: "Go to Login",
        mismatch: "Passwords do not match",
        invalidToken: "Invalid or expired token",
        signIn: "Sign In"
    },
    Tamil: {
        title: "கடவுச்சொல்லை மீட்டமைக்கவும்",
        desc: "உங்கள் புதிய கடவுச்சொல்லை கீழே உள்ளிடவும்.",
        newPassword: "புதிய கடவுச்சொல்",
        confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        resetBtn: "கடவுச்சொல்லை மாற்றவும்",
        resetting: "மாற்றப்படுகிறது...",
        success: "வெற்றிகரமாக மாற்றப்பட்டது!",
        successDesc: "உங்கள் கடவுச்சொல் மாற்றப்பட்டது. நீங்கள் இப்போது உள்நுழையலாம்.",
        loginBtn: "உள்நுழைவிற்குச் செல்லவும்",
        mismatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
        signIn: "உள்நுழைக"
    }
};

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const { language, setLanguage } = useLanguage();
    const t = translations[language] || translations['English'];

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t.mismatch);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                setError(data.error || t.invalidToken);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col font-inter">
            {/* Background Hero Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.9]" 
                style={{ backgroundImage: `url(${loginHero})` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 lg:bg-gradient-to-r lg:from-primary/20 lg:to-transparent" />

            {/* Top Navigation Bar */}
            <nav className="relative z-20 w-full px-6 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary p-2 rounded-xl shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight font-outfit uppercase">InternHub</span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                        <Globe className="w-4 h-4 text-white/70" />
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="text-xs font-black text-white bg-transparent border-none outline-none focus:ring-0 cursor-pointer uppercase tracking-widest"
                        >
                            <option value="English" className="text-black">EN</option>
                            <option value="Tamil" className="text-black">TA</option>
                        </select>
                    </div>

                    <div className="hidden sm:flex items-center space-x-2">
                        <Link to="/login" className="px-6 py-2.5 bg-white text-primary rounded-xl text-sm font-black shadow-lg hover:bg-white/90 transition-all active:scale-95 uppercase tracking-widest">
                            {t.signIn}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
                        
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-text font-outfit uppercase tracking-widest">
                                {t.title}
                            </h2>
                            {!submitted && <p className="text-xs font-bold text-muted mt-2 uppercase tracking-widest">{t.desc}</p>}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="animate-fade-in-up">
                            {submitted ? (
                                <div className="text-center space-y-6 py-4 animate-fade-in">
                                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 shadow-inner">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-text font-outfit uppercase tracking-widest">{t.success}</h3>
                                        <p className="text-sm text-muted font-medium">{t.successDesc}</p>
                                    </div>
                                    <Link to="/login" className="w-full btn-primary py-4 inline-block text-lg font-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                                        {t.loginBtn}
                                    </Link>
                                </div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t.newPassword}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-field pl-12 pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t.confirmPassword}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="input-field pl-12"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary py-4 text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? t.resetting : t.resetBtn}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="relative z-20 w-full py-8 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                &copy; 2026 InternHub Platform • All Rights Reserved
            </footer>
        </div>
    );
}
