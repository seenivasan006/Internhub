import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, Briefcase, GraduationCap, PenTool, Settings, UserCircle, Globe, Bookmark, ClipboardList, HelpCircle, MessageCircle, MessageSquare, Building } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LocationManager } from './LocationManager';

const translations: Record<string, any> = {
    English: {
        Dashboard: 'Dashboard',
        Internships: 'Internships',
        Scholarships: 'Scholarships',
        ScholarshipsForYou: 'Scholarships For You',
        EssayWriter: 'Essay Writer',
        SavedItems: 'Saved Items',
        Settings: 'Settings',
        Welcome: 'Welcome',
        Loading: 'Loading...',
        Hi: 'Hi',
        MyApplications: 'My Applications',
        Support: 'Support',
        FAQ: 'FAQ'
    },
    Tamil: {
        Dashboard: 'முகப்பு',
        Internships: 'இன்டர்ன்ஷிப்கள்',
        Scholarships: 'உதவித்தொகைகள்',
        ScholarshipsForYou: 'உங்களுக்கான உதவித்தொகைகள்',
        EssayWriter: 'கட்டுரை எழுதுபவர்',
        SavedItems: 'சேமிக்கப்பட்டவை',
        Settings: 'அமைப்புகள்',
        Welcome: 'வரவேற்பு',
        Loading: 'ஏற்றுகிறது...',
        Hi: 'வணக்கம்',
        MyApplications: 'எனது விண்ணப்பங்கள்',
        Support: 'ஆதரவு',
        FAQ: 'கேள்வி பதில்'
    },
    Hindi: {
        Dashboard: 'डैशबोर्ड',
        Internships: 'इंटर्नशिप',
        Scholarships: 'छात्रवृत्ति',
        ScholarshipsForYou: 'आपके लिए छात्रवृत्ति',
        EssayWriter: 'निबंध लेखक',
        SavedItems: 'सहेजे गए आइटम',
        Settings: 'सेटिंग्स',
        Welcome: 'स्वागत है',
        Loading: 'लोड हो रहा है...',
        Hi: 'नमस्ते',
        MyApplications: 'मेरे आवेदन',
        Support: 'सहायता',
        FAQ: 'सवाल जवाब'
    }
};

export const Layout = () => {
    const { user, loading } = useAuth();
    const { language, setLanguage } = useLanguage();
    const location = useLocation();

    const t = translations[language] || translations['English'];

    if (loading) return <div className="min-h-screen flex items-center justify-center">{t.Loading}</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.onboarding_completed && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    const navItems = [
        { icon: LayoutDashboard, label: t.Dashboard, path: '/dashboard' },
        { icon: Briefcase, label: t.Internships, path: '/internships' },
        { icon: GraduationCap, label: t.Scholarships, path: '/scholarships' },
        { icon: GraduationCap, label: t.ScholarshipsForYou, path: '/scholarships/recommended' },
        { icon: Bookmark, label: t.SavedItems, path: '/saved' },
        { icon: ClipboardList, label: t.MyApplications, path: '/applications' },
        { icon: PenTool, label: t.EssayWriter, path: '/essay' },
        { icon: MessageCircle, label: t.Support, path: '/support' },
        { icon: HelpCircle, label: t.FAQ, path: '/faq' },
        { icon: Settings, label: t.Settings, path: '/settings' },
    ];

    if (user.isAdmin || user.role === 'admin') {
        navItems.push({ icon: LayoutDashboard, label: 'Admin Panel', path: '/admin' });
    }

    if (user.role === 'provider') {
        navItems.push({ icon: Building, label: 'Provider Panel', path: '/provider' });
    }

    return (
        <div className="flex h-screen bg-background text-text transition-colors duration-300">
            <LocationManager />
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col">
                <div className="h-16 flex items-center justify-between px-6 border-b border-border dark:border-gray-800">
                    <h1 className="text-xl font-bold text-primary">InternHub</h1>

                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        <div className="relative group transition-all">
                            <div className="flex items-center px-2 py-1 rounded-lg bg-muted/10 border border-border dark:border-gray-700 hover:bg-white hover:border-white transition-all group-hover:shadow-sm">
                                <Globe className="w-3.5 h-3.5 text-muted group-hover:text-black transition-colors" />
                                <span className="text-[10px] ml-1.5 font-bold text-muted group-hover:text-black transition-colors">
                                    {language === 'Tamil' ? 'TA' : language === 'Hindi' ? 'HI' : 'EN'}
                                </span>
                            </div>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Change Language"
                            >
                                <option value="English">English</option>
                                <option value="Tamil">தமிழ்</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-2.5 sm:text-sm rounded-lg transition-all group ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-text hover:bg-white hover:text-black hover:shadow-md'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-black'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link
                        to="/profile"
                        className="flex items-center w-full px-3 py-2.5 sm:text-sm text-text bg-muted/10 border border-border rounded-lg hover:bg-white hover:text-black hover:border-white transition-all shadow-sm group"
                        title="View Profile"
                    >
                        <UserCircle className="w-5 h-5 mr-3 flex-shrink-0 text-muted group-hover:text-black transition-colors" />
                        <span className="truncate font-medium">{user.full_name || user.email}</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-16 px-8 flex items-center border-b border-border bg-card sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-text">
                        {navItems.find(i => i.path === location.pathname)?.label || t.Welcome}
                    </h2>
                    <div className="ml-auto flex items-center text-sm font-medium text-muted">
                        {t.Hi}, {user.full_name}
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
