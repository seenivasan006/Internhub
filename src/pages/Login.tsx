import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { Globe, Eye, EyeOff, Sparkles, Quote, ChevronDown, CheckCircle, Target, Trophy } from 'lucide-react';
import loginHero from '../assets/login-hero.png';

const translations: Record<string, any> = {
    English: {
        title: "Sign in to InternHub",
        email: "Email address",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in...",
        or: "Or continue with",
        register: "Register",
        signup: "Sign Up",
        forgotPassword: "Forgot Password?",
        heroTitle: "Architecting the Careers of Tomorrow",
        heroDesc: "A premier ecosystem designed to bridge the gap between academic brilliance and industry leadership.",
        aboutTitle: "The InternHub Vision",
        aboutHeadline: "Engineering Success through Curated Excellence",
        aboutDesc: "InternHub is more than a platform; it is a professional catalyst. We empower ambitious students by providing direct pathways to transformative internships and prestigious scholarships, engineering a future where opportunity is democratic and talent is the only currency.",
        feature1: "Curated Internships",
        feature1Desc: "Access exclusive opportunities at top-tier firms across the globe.",
        feature2: "Strategic Scholarships",
        feature2Desc: "Secure funding through profile-matched scholarship recommendations.",
        feature3: "Industry Readiness",
        feature3Desc: "Bridge the gap with tools designed for the modern professional landscape.",
        quotesTitle: "Words of Leadership",
        ctaTitle: "Ready to Begin Your Journey?",
        ctaDesc: "Join thousands of students who are already engineering their future with InternHub."
    },
    Tamil: {
        title: "InternHub-ல் உள்நுழையவும்",
        email: "மின்னஞ்சல் முகவரி",
        password: "கடவுச்சொல்",
        signIn: "உள்நுழைக",
        signingIn: "உள்நுழைகிறது...",
        or: "அல்லது இதன் மூலம் தொடரவும்",
        register: "பதிவு",
        signup: "பதிவு செய்யவும்",
        heroTitle: "நாளைய வாழ்க்கையை வடிவமைப்போம்",
        heroDesc: "மாணவர்களின் திறமையை தொழில்முறை வாய்ப்புகளுடன் இணைக்கும் ஒரு சிறந்த தளம்.",
        aboutTitle: "InternHub-ன் பார்வை",
        aboutHeadline: "தொழில்முறை சிறப்பின் நுழைவாயில்"
    }
};

const quotes = [
    {
        text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
        author: "Steve Jobs",
        role: "Co-founder, Apple Inc."
    },
    {
        text: "Success is not final; failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill",
        role: "Former Prime Minister of the UK"
    },
    {
        text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.",
        author: "Thomas Edison",
        role: "Inventor & Businessman"
    }
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requirePasswordGoogle, setRequirePasswordGoogle] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    const [googlePassword, setGooglePassword] = useState('');

    const { login } = useAuth();
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const t = translations[language] || translations['English'];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to login');
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            
            if (!meRes.ok) throw new Error(meData.error || 'Failed to fetch user profile');
            
            if (meData.user) {
                login({ user: meData.user });
                navigate(data.redirect || '/dashboard');
            } else {
                throw new Error('User profile not found');
            }
        } catch (err: any) {
            console.error('Login Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential, isRegister: false })
            });
            const data = await res.json();
            
            if (data.requirePassword) {
                setGoogleEmail(data.email);
                setRequirePasswordGoogle(true);
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Google login failed');
            
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            
            if (!meRes.ok) throw new Error(meData.error || 'Failed to fetch user profile after Google login');

            if (meData.user) {
                login({ user: meData.user });
                navigate(data.redirect || '/dashboard');
            } else {
                throw new Error('User profile not found after Google login');
            }
        } catch (err: any) {
            console.error('Google Login Error:', err);
            setError(err.message);
            
            // If account is not found, take them to registration after 2 seconds
            if (err.message?.includes('not found') || err.message?.includes('register')) {
                setTimeout(() => {
                    navigate('/register', { state: { email: 'google_attempt' } });
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGooglePasswordVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/google-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleEmail, password: googlePassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');

            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            if (meData.user) {
                login({ user: meData.user });
                navigate(data.redirect || '/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-inter bg-slate-50 overflow-x-hidden">
            
            {/* STICKY NAVIGATION */}
            <nav className="fixed top-0 z-50 w-full px-6 lg:px-12 py-5 flex items-center justify-between transition-all bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary p-2 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight font-outfit">InternHub</span>
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="text-[10px] font-black text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer uppercase tracking-widest"
                        >
                            <option value="English">EN</option>
                            <option value="Tamil">TA</option>
                            <option value="Hindi">HI</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a href="#portal" className="hidden lg:block text-xs font-black text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">
                            Portal
                        </a>
                        <a href="#about" className="hidden lg:block text-xs font-black text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">
                            Vision
                        </a>
                        <Link to="/register" className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                            {t.signup}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* SECTION 1: THE GATEWAY (PORTAL) */}
            <section id="portal" className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
                {/* Immersive Background */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.8] transition-transform duration-[20s] hover:scale-105" 
                    style={{ backgroundImage: `url(${loginHero})` }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Hero Text */}
                    <div className="hidden lg:block animate-fade-in-up">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6 font-outfit">
                            <Sparkles className="w-4 h-4 text-primary-light" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t.proHeadline || "The Future is Now"}</span>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-6 leading-[1.1] font-outfit shadow-text">
                            {t.heroTitle}
                        </h1>
                        <p className="text-xl text-white/80 font-medium max-w-lg leading-relaxed">
                            {t.heroDesc}
                        </p>
                    </div>

                    {/* Auth Card Container */}
                    <div className="flex justify-center lg:justify-end animate-fade-in-up">
                        <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/30 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] text-slate-900">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 font-outfit">
                                {requirePasswordGoogle ? "Verify Identity" : t.title}
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-shake">
                                    {error}
                                </div>
                            )}

                            {requirePasswordGoogle ? (
                                <form className="space-y-6" onSubmit={handleGooglePasswordVerify}>
                                    <p className="text-sm font-bold text-slate-500 mb-4">
                                        Please enter your password for <span className="text-primary">{googleEmail}</span> to complete Google login.
                                    </p>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.password}</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={googlePassword}
                                                onChange={e => setGooglePassword(e.target.value)}
                                                className="input-field bg-slate-50/50 border-slate-200 text-slate-900 pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 group-hover:text-primary transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary py-4 text-sm font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                                    >
                                        {loading ? "Verifying..." : "Verify & Sign In"}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setRequirePasswordGoogle(false)}
                                        className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </form>
                            ) : (
                                <form className="space-y-6" onSubmit={handleLogin}>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.email}</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="input-field bg-slate-50/50 border-slate-200 text-slate-900"
                                            placeholder="you@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.password}</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-field bg-slate-50/50 border-slate-200 text-slate-900 pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 group-hover:text-primary transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary py-4 text-sm font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                                    >
                                        {loading ? t.signingIn : t.signIn}
                                    </button>
                                </form>
                            )}

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                                        <span className="px-4 bg-white text-slate-400">{t.or}</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Login Failed')}
                                        shape="pill"
                                        text="continue_with"
                                        width="100%"
                                    />
                                </div>

                                <div className="mt-8 text-center lg:hidden">
                                    <p className="text-xs font-bold text-slate-500">
                                        {t.noAccount}{' '}
                                        <Link to="/register" className="font-black text-primary hover:underline">
                                            {t.register}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center space-y-2 opacity-50">
                    <span className="text-[10px] font-black uppercase text-white tracking-[0.3em]">Explore</span>
                    <ChevronDown className="w-5 h-5 text-white" />
                </div>
            </section>

            {/* SECTION 2: THE VISION (ABOUT) */}
            <section id="about" className="py-24 lg:py-40 bg-white relative overflow-hidden">
                {/* Subtle Background Texture */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-12 translate-x-1/4 -z-10" />
                
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 block">{t.aboutTitle}</span>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 font-outfit leading-tight">
                                {t.aboutHeadline}
                            </h2>
                            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12">
                                {t.aboutDesc}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{t.feature1}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{t.feature1Desc}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{t.feature2}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{t.feature2Desc}</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Vision Card */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-[3rem] opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-700" />
                            <div className="relative bg-slate-900 rounded-[2.5rem] p-10 lg:p-16 overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px]" />
                                
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black text-white mb-8 font-outfit">{t.ctaTitle}</h3>
                                    <p className="text-white/60 mb-10 text-lg leading-relaxed">{t.ctaDesc}</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-green-500/20 p-1.5 rounded-lg mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                                            <span className="text-white/80 font-medium">Global Network Access</span>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-green-500/20 p-1.5 rounded-lg mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                                            <span className="text-white/80 font-medium">Smart Profile-Matching</span>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-green-500/20 p-1.5 rounded-lg mt-1"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                                            <span className="text-white/80 font-medium">Professional Identity Suite</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => navigate('/register')} className="w-full mt-12 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-white/5 hover:bg-slate-50 transition-all active:scale-95">
                                        Join the Elite
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: INSPIRATION (QUOTES) */}
            <section className="py-24 lg:py-40 bg-slate-900 relative overflow-hidden">
                {/* Dynamic Lighting Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full" />
                
                <div className="max-w-4xl mx-auto px-6 text-center space-y-16">
                    <span className="text-xs font-black text-primary uppercase tracking-[0.4em] block">{t.quotesTitle}</span>
                    
                    <div className="relative">
                        <Quote className="absolute -top-12 -left-8 w-24 h-24 text-white/5" />
                        
                        <div className="space-y-12">
                            {quotes.map((q, idx) => (
                                <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 200}ms` }}>
                                    <blockquote className="text-2xl lg:text-3xl font-medium text-white/90 font-outfit leading-snug italic mb-6">
                                        "{q.text}"
                                    </blockquote>
                                    <cite className="not-italic">
                                        <span className="block text-primary font-black uppercase tracking-widest text-sm mb-1">{q.author}</span>
                                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">{q.role}</span>
                                    </cite>
                                    {idx !== quotes.length - 1 && <div className="w-12 h-[1px] bg-white/10 mx-auto mt-12" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA FOOTER */}
            <footer className="py-20 bg-slate-950 border-t border-white/5 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col items-center space-y-8">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-lg font-black text-white tracking-widest font-outfit">INTERNHUB</span>
                        </div>
                        
                        <div className="flex space-x-8 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Career Pathways</a>
                        </div>
                        
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mt-8">
                            &copy; 2026 Architectural Journey • High Performance Career Ecosystem
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
