import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ArrowLeft, Mail, CheckCircle, ShieldQuestion, Key, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import loginHero from '../assets/login-hero.png';

const translations: Record<string, any> = {
    English: {
        title: "Recover Account",
        desc: "Choose a method to reset your password.",
        email: "Email address",
        sendLink: "Send Reset Link",
        verifyQuestions: "Verify Security Questions",
        tryOTP: "Use OTP Verification",
        tryLink: "Use Email Link",
        backToLogin: "Back to Login",
        success: "Password reset successful!",
        otpSent: "OTP sent to your email",
        enterOtp: "Enter 6-digit OTP",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        resetBtn: "Update Password",
        questionsTitle: "Security Questions",
        questionsDesc: "Please answer exactly as set during registration.",
        mismatch: "Passwords do not match",
        verified: "Identity Verified!",
        anotherWay: "Try another way",
        sendLinkSuccess: "Reset link sent! Check your inbox.",
        useQuestions: "Use Security Questions",
        useOTP: "Use OTP Code",
        useLink: "Use Email Link",
        signIn: "Sign In",
        signup: "Sign Up"
    },
    Tamil: {
        title: "கணக்கை மீட்டெடுக்கவும்",
        desc: "கடவுச்சொல்லை மீட்டமைக்க ஒரு முறையைத் தேர்ந்தெடுக்கவும்.",
        email: "மின்னஞ்சல் முகவரி",
        backToLogin: "உள்நுழைவு பக்கத்திற்குச் செல்லவும்",
        success: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!",
        anotherWay: "வேறு வழியில் முயற்சிக்கவும்",
        sendLinkSuccess: "இணைப்பு அனுப்பப்பட்டது!",
        signIn: "உள்நுழைக",
        signup: "பதிவு"
    }
};

type RecoveryStep = 'IDENTIFY' | 'QUESTIONS' | 'OTP' | 'RESET' | 'SUCCESS';

export default function ForgotPassword() {
    const [step, setStep] = useState<RecoveryStep>('IDENTIFY');
    const [email, setEmail] = useState('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState(['', '', '']);
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showMethods, setShowMethods] = useState(false);
    const [linkSent, setLinkSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { language, setLanguage } = useLanguage();
    const t = translations[language] || translations['English'];

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/check-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'User not found');
            setQuestions(data.questions);
            setStep('QUESTIONS');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyQuestions = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, answers })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Incorrect answers');
            setResetToken(data.resetToken);
            setStep('RESET');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        setLoading(true);
        setError('');
        setShowMethods(false);
        try {
            const res = await fetch('/api/auth/send-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error('Failed to send OTP');
            setStep('OTP');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendResetLink = async () => {
        setLoading(true);
        setError('');
        setShowMethods(false);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
            setLinkSent(true);
            setTimeout(() => setLinkSent(false), 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid OTP');
            setResetToken(data.resetToken);
            setStep('RESET');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t.mismatch);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: resetToken, password: newPassword })
            });
            if (!res.ok) throw new Error('Failed to reset password');
            setStep('SUCCESS');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderIdentify = () => (
        <form className="space-y-6" onSubmit={handleIdentify}>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t.email}</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="input-field pl-12"
                        placeholder="you@email.com"
                    />
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                {loading ? '...' : 'Continue'}
            </button>
        </form>
    );

    const renderQuestions = () => (
        <form className="space-y-6" onSubmit={handleVerifyQuestions}>
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <ShieldQuestion className="w-5 h-5" />
                    <h3 className="font-black font-outfit uppercase tracking-widest text-sm">{t.questionsTitle}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed font-medium">{t.questionsDesc}</p>

                {questions.map((q, idx) => (
                    <div key={idx} className="space-y-2">
                        <label className="text-[10px] font-black text-muted uppercase tracking-widest block">{q}</label>
                        <input
                            type="text"
                            required
                            value={answers[idx]}
                            onChange={e => {
                                const newAnswers = [...answers];
                                newAnswers[idx] = e.target.value;
                                setAnswers(newAnswers);
                            }}
                            className="input-field"
                            placeholder="Your answer..."
                        />
                    </div>
                ))}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-black shadow-lg">
                {loading ? '...' : t.verifyQuestions}
            </button>

            {renderAlternativeToggle()}
        </form>
    );

    const renderAlternativeToggle = () => (
        <div className="mt-8 pt-6 border-t border-border">
            {showMethods ? (
                <div className="space-y-3 animate-fade-in">
                    <button type="button" onClick={() => { setStep('QUESTIONS'); setShowMethods(false); }} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all">
                        <span className="text-sm font-black uppercase tracking-widest text-text/70">{t.useQuestions}</span>
                        <ShieldQuestion className="w-5 h-5 text-primary" />
                    </button>
                    <button type="button" onClick={handleSendOTP} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all">
                        <span className="text-sm font-black uppercase tracking-widest text-text/70">{t.useOTP}</span>
                        < Key className="w-5 h-5 text-primary" />
                    </button>
                    <button type="button" onClick={handleSendResetLink} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 border-2 border-transparent hover:border-primary/20 transition-all">
                        <span className="text-sm font-black uppercase tracking-widest text-text/70">{t.useLink}</span>
                        <Mail className="w-5 h-5 text-primary" />
                    </button>
                    <button type="button" onClick={() => setShowMethods(false)} className="w-full text-xs text-muted font-bold py-2 opacity-50 hover:opacity-100 transition-opacity">
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex justify-center">
                    <button type="button" onClick={() => setShowMethods(true)} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                        {t.anotherWay}?
                    </button>
                </div>
            )}
        </div>
    );

    const renderOTP = () => (
        <form className="space-y-6" onSubmit={handleVerifyOTP}>
            <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                    <Key className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl font-outfit uppercase tracking-widest">{t.otpSent}</h3>
                <p className="text-sm text-muted font-medium">{email}</p>
            </div>
            <div>
                <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full bg-muted/20 border-2 border-primary/20 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="000000"
                />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-black shadow-lg">
                {loading ? '...' : 'Verify OTP'}
            </button>

            {renderAlternativeToggle()}
        </form>
    );

    const renderReset = () => (
        <form className="space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-2 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-black text-xl font-outfit uppercase tracking-widest">{t.verified}</h3>
                <p className="text-sm text-muted font-medium">Create a strong new password.</p>
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t.newPassword}</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="input-field pl-12 pr-12"
                        placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-black shadow-lg">
                {loading ? '...' : t.resetBtn}
            </button>
        </form>
    );

    const renderSuccess = () => (
        <div className="text-center space-y-6 py-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 shadow-inner">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-text font-outfit uppercase tracking-widest">{t.success}</h3>
                <p className="text-sm text-muted font-medium">Your credentials have been updated. You can now access your account.</p>
            </div>
            <Link to="/login" className="w-full btn-primary py-4 inline-block text-lg font-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                {t.backToLogin}
            </Link>
        </div>
    );

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
                    <span className="text-2xl font-black text-white tracking-tight font-outfit">InternHub</span>
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
                        <h2 className="text-2xl font-black text-text/90 mb-2 font-outfit uppercase tracking-widest">
                            {t.title}
                        </h2>
                        {step === 'IDENTIFY' && <p className="text-xs font-bold text-muted mb-8 uppercase tracking-widest">Enter details to recover access</p>}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold animate-shake">
                                {error}
                            </div>
                        )}
                        {linkSent && (
                            <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-100 rounded-2xl text-sm font-bold">
                                {t.sendLinkSuccess}
                            </div>
                        )}

                        <div className="animate-fade-in-up">
                            {step === 'IDENTIFY' && renderIdentify()}
                            {step === 'QUESTIONS' && renderQuestions()}
                            {step === 'OTP' && renderOTP()}
                            {step === 'RESET' && renderReset()}
                            {step === 'SUCCESS' && renderSuccess()}
                        </div>

                        {step !== 'SUCCESS' && (
                            <div className="mt-8 text-center border-t border-border pt-8">
                                <Link to="/login" className="inline-flex items-center text-xs font-black text-primary hover:underline uppercase tracking-widest group">
                                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    {t.backToLogin}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <footer className="relative z-20 w-full py-8 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                &copy; 2026 InternHub Platform • All Rights Reserved
            </footer>
        </div>
    );
}
