import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { Globe, Eye, EyeOff, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import loginHero from '../assets/login-hero.png';

const translations: Record<string, any> = {
    English: {
        title: "Join InternHub",
        fullname: "Full Name",
        email: "Email address",
        password: "Password",
        sendOtp: "Send Verification OTP",
        sending: "Sending OTP...",
        enterOtp: "Enter 6-Digit OTP",
        sentTo: "Sent to",
        verify: "Verify and Create Account",
        verifying: "Verifying...",
        back: "Back",
        or: "Or continue with",
        haveAccount: "Already have an account?",
        signIn: "Sign in",
        signup: "Sign Up"
    },
    Tamil: {
        title: "InternHub-ல் இணையுங்கள்",
        fullname: "முழு பெயர்",
        email: "மின்னஞ்சல் முகவரி",
        password: "கடவுச்சொல்",
        sendOtp: "OTP-ஐ அனுப்பவும்",
        signup: "பதிவு"
    }
};

export default function Register() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        securityQuestions: [
            { question: 'What is your first school name?', answer: '' },
            { question: 'What is your favorite food?', answer: '' },
            { question: 'What is the name of your first pet?', answer: '' }
        ]
    });
    const [otp, setOtp] = useState('');
    const [googleCredential, setGoogleCredential] = useState('');
    const [showHybridForm, setShowHybridForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const t = translations[language] || translations['English'];

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential, isRegister: true })
            });
            const data = await res.json();
            
            if (data.requireHybridFields) {
                setGoogleCredential(credentialResponse.credential);
                setShowHybridForm(true);
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Google registration failed');
            
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            
            if (!meRes.ok) throw new Error(meData.error || 'Failed to fetch user profile');

            if (meData.user) {
                login({ user: meData.user });
                navigate(data.redirect || '/onboarding');
            } else {
                throw new Error('User profile not created');
            }
        } catch (err: any) {
            console.error('Google Register Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleHybridSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    credential: googleCredential, 
                    isRegister: true,
                    password: formData.password,
                    securityQuestions: formData.securityQuestions
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hybrid signup failed');

            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            if (meData.user) {
                login({ user: meData.user });
                navigate(data.redirect || '/onboarding');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            await fetch('/api/auth/logout', { method: 'POST' });
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col font-inter">
            {/* Immersive Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.8]" 
                style={{ backgroundImage: `url(${loginHero})` }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

            {/* Navigation */}
            <nav className="relative z-20 w-full px-6 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary p-2 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
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
                </div>
            </nav>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg animate-fade-in-up">
                    <div className="bg-white/95 backdrop-blur-2xl border border-white/30 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-slate-900">
                        <h2 className="text-2xl font-black text-slate-900 mb-8 font-outfit uppercase tracking-widest">
                            {t.title}
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black tracking-widest uppercase animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="animate-fade-in-up">
                        <div className="animate-fade-in-up">
                            {showHybridForm ? (
                                <form className="space-y-6" onSubmit={handleGoogleHybridSignup}>
                                    <div className="flex items-center space-x-4 mb-6">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowHybridForm(false)}
                                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                                        </button>
                                        <h3 className="text-lg font-black font-outfit uppercase tracking-widest text-slate-900">Finish Setup</h3>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.password}</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="input-field bg-slate-50/50 border-slate-200 text-slate-900 pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 group-hover:text-primary transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Security Questions</label>
                                        {formData.securityQuestions.map((q, idx) => (
                                            <div key={idx}>
                                                <label className="block text-[9px] font-bold text-slate-400 mb-1">{q.question}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="input-field-sm py-3 bg-slate-50/50 border-slate-200 text-slate-900"
                                                    value={formData.securityQuestions[idx].answer}
                                                    onChange={e => {
                                                        const nq = [...formData.securityQuestions];
                                                        nq[idx].answer = e.target.value;
                                                        setFormData({...formData, securityQuestions: nq});
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                        {loading ? 'Finalizing...' : 'Complete Registration'}
                                    </button>
                                </form>
                            ) : (
                                <>
                                    {step === 1 && (
                                        <form className="space-y-6" onSubmit={handleSendOTP}>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.fullname}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.full_name}
                                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                    className="input-field bg-slate-50/50 border-slate-200 text-slate-900"
                                                    placeholder="Jane Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.email}</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="input-field bg-slate-50/50 border-slate-200 text-slate-900"
                                                    placeholder="jane@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.password}</label>
                                                <div className="relative group">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        value={formData.password}
                                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        className="input-field bg-slate-50/50 border-slate-200 text-slate-900 pr-12"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 group-hover:text-primary transition-colors"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                                {loading ? t.sending : t.sendOtp}
                                            </button>
                                        </form>
                                    )}

                                    {step === 3 && (
                                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                            <h3 className="text-lg font-black font-outfit uppercase tracking-widest text-slate-900 mb-4">Security Protocol</h3>
                                            {formData.securityQuestions.map((q, idx) => (
                                                <div key={idx}>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{q.question}</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="input-field bg-slate-50/50 border-slate-200 text-slate-900"
                                                        value={formData.securityQuestions[idx].answer}
                                                        onChange={e => {
                                                            const nq = [...formData.securityQuestions];
                                                            nq[idx].answer = e.target.value;
                                                            setFormData({...formData, securityQuestions: nq});
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <button type="submit" className="w-full btn-primary py-4 font-black uppercase tracking-widest">Verify Identity</button>
                                        </form>
                                    )}

                                    {step === 2 && (
                                        <form className="space-y-6" onSubmit={handleVerifyOTP}>
                                            <div className="text-center">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{t.enterOtp}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={6}
                                                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] focus:border-primary transition-all outline-none text-slate-900"
                                                    placeholder="000000"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value)}
                                                />
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full btn-primary py-4 font-black uppercase tracking-widest shadow-xl">
                                                {loading ? t.verifying : t.verify}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>

                            {step === 1 && !showHybridForm && (
                                <div className="mt-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="px-4 bg-white text-slate-400">{t.or}</span></div>
                                    </div>
                                    <div className="mt-8 flex justify-center">
                                        <GoogleLogin 
                                            onSuccess={handleGoogleSuccess} 
                                            onError={() => setError('Google Registration Failed')} 
                                            shape="pill" 
                                            text="signup_with" 
                                            width="100%" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 text-center border-t border-slate-100 pt-8">
                                <p className="text-xs font-bold text-slate-500">
                                    {t.haveAccount}{' '}
                                    <Link to="/login" className="font-black text-primary hover:underline uppercase">
                                        {t.signIn}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
