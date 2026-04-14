import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User as UserIcon, MapPin, GraduationCap, Briefcase, Languages, DollarSign, FileText } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        personalDetails: 'Personal Details',
        location: 'Location',
        notSet: 'Not set',
        preferredLanguage: 'Preferred Language',
        community: 'Community',
        gender: 'Gender',
        familyIncome: 'Family Income',
        educationCareer: 'Education & Career',
        educationLevel: 'Education Level',
        companyCollege: 'Company / College',
        degree: 'Degree',
        viewResume: 'View Resume',
        skills: 'Skills',
        noSkills: 'No skills added.',
        accountActions: 'Account Actions',
        signOut: 'Sign Out of InternHub'
    },
    Tamil: {
        personalDetails: 'தனிப்பட்ட விவரங்கள்',
        location: 'இடம்',
        notSet: 'அமைக்கப்படவில்லை',
        preferredLanguage: 'விருப்பமான மொழி',
        community: 'சமூகம்',
        gender: 'பாலினம்',
        familyIncome: 'குடும்ப வருமானம்',
        educationCareer: 'கல்வி & தொழில்',
        educationLevel: 'கல்வி நிலை',
        companyCollege: 'நிறுவனம் / கல்லூரி',
        degree: 'பட்டம்',
        viewResume: 'ரெஸ்யூமைப் பார்',
        skills: 'திறன்கள்',
        noSkills: 'திறன்கள் சேர்க்கப்படவில்லை.',
        accountActions: 'பயனர் கணக்கு செயல்கள்',
        signOut: 'InternHub-லிருந்து வெளியேறு'
    },
    Hindi: {
        personalDetails: 'व्यक्तिगत विवरण',
        location: 'स्थान',
        notSet: 'सेट नहीं है',
        preferredLanguage: 'पसंदीदा भाषा',
        community: 'समुदाय',
        gender: 'लिंग',
        familyIncome: 'पारिवारिक आय',
        educationCareer: 'शिक्षा और करियर',
        educationLevel: 'शिक्षा स्तर',
        companyCollege: 'कंपनी / कॉलेज',
        degree: 'डिग्री',
        viewResume: 'रिज्यूमे देखें',
        skills: 'कौशल',
        noSkills: 'कोई कौशल नहीं जोड़ा गया।',
        accountActions: 'खाता कार्रवाइयां',
        signOut: 'InternHub से साइन आउट करें'
    }
};

export default function Profile() {
    const { user, logout } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const t = translations[language] || translations['English'];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="bg-card p-2 rounded-full shadow-lg">
                            <div className="bg-indigo-100 rounded-full w-24 h-24 flex items-center justify-center">
                                <span className="text-4xl font-bold text-indigo-700">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <h2 className="text-3xl font-extrabold text-text">{user.full_name}</h2>
                    <p className="text-muted font-medium">{user.email}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

                        {/* Core Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-text border-b pb-2">{t.personalDetails}</h3>

                            <div className="flex items-center text-sm">
                                <MapPin className="w-5 h-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.location}</p>
                                    <p className="text-text font-medium">{user.location || t.notSet}, {user.state || t.notSet}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <Languages className="w-5 h-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.preferredLanguage}</p>
                                    <p className="text-text font-medium">{user.preferred_language}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <UserIcon className="w-5 h-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.community}</p>
                                    <p className="text-text font-medium">{user.community || t.notSet}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <UserIcon className="w-5 h-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.gender}</p>
                                    <p className="text-text font-medium">{user.gender || t.notSet}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <DollarSign className="w-5 h-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.familyIncome}</p>
                                    <p className="text-text font-medium">₹{user.income?.toLocaleString() || t.notSet}</p>
                                </div>
                            </div>
                        </div>

                        {/* Professional & Academic */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-text border-b pb-2">{t.educationCareer}</h3>

                            <div className="flex items-center text-sm">
                                <GraduationCap className="w-5 h-5 text-purple-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.educationLevel}</p>
                                    <p className="text-text font-medium">{user.education_level || t.notSet}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <Briefcase className="w-5 h-5 text-purple-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.companyCollege}</p>
                                    <p className="text-text font-medium">{user.college_or_company || t.notSet}</p>
                                </div>
                            </div>

                            <div className="flex items-center text-sm">
                                <FileText className="w-5 h-5 text-purple-500 mr-3" />
                                <div>
                                    <p className="text-muted text-xs font-semibold">{t.degree}</p>
                                    <p className="text-text font-medium">{user.degree || t.notSet}</p>
                                </div>
                            </div>

                            {user.resume_link && (
                                <div className="mt-2 pl-8">
                                    <a
                                        href={user.resume_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold underline"
                                    >
                                        {t.viewResume}
                                    </a>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-8">
                        <h3 className="text-sm font-bold text-muted mb-3 uppercase tracking-wider">{t.skills}</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.skills && user.skills.length > 0 ? user.skills.map((skill, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold">
                                    {skill}
                                </span>
                            )) : (
                                <span className="text-sm text-gray-400 italic">{t.noSkills}</span>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <h3 className="text-sm font-bold text-red-500 mb-4 uppercase tracking-wider">{t.accountActions}</h3>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            {t.signOut}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
