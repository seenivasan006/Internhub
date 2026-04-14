import { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, Lightbulb, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DetailModal } from '../components/DetailModal';
import CareerPath from '../components/CareerPath'; // INTERNHUB_PHASE2_UPDATE
import AIRecommendations from '../components/AIRecommendations'; // INTERNHUB_AI_MATCHING

const translations: Record<string, any> = {
    English: {
        loading: 'Loading dashboard...',
        findInternships: 'Find Internships',
        findInternshipsDesc: 'Discover career-launching internships matched to your unique skills.',
        browseInternships: 'Browse Internships',
        findScholarships: 'Find Scholarships',
        findScholarshipsDesc: 'Explore financial aid and scholarships you actually qualify for.',
        scholarshipsForYou: 'Scholarships For You',
        topInternships: 'Top Internship Matches',
        viewAll: 'View all',
        noInternships: 'No recommendations yet. Update your profile skills or browse opportunities.',
        new: 'NEW',
        recommendedScholarships: 'Recommended Scholarships',
        noScholarships: 'No recommendations yet. Update your profile skills or browse opportunities.',
        recentlyAdded: 'Recently Added Opportunities',
        noData: 'No opportunities found. Click "Browse" to explore more!'
    },
    Tamil: {
        loading: 'முகப்பு ஏற்றுகிறது...',
        findInternships: 'இன்டர்ன்ஷிப்களைக் கண்டறியவும்',
        findInternshipsDesc: 'உங்கள் திறன்களுக்குப் பொருந்தக்கூடிய இன்டர்ன்ஷிப்களைப் பெறுங்கள்.',
        browseInternships: 'இன்டர்ன்ஷிப்களைத் தேடுங்கள்',
        findScholarships: 'உதவித்தொகைகளைக் கண்டறியவும்',
        findScholarshipsDesc: 'நீங்கள் தகுதிவாய்ந்த உதவித்தொகைகளை ஆராயுங்கள்.',
        scholarshipsForYou: 'உங்களுக்கான உதவித்தொகைகள்',
        topInternships: 'சிறந்த இன்டர்ன்ஷிப்கள்',
        viewAll: 'அனைத்தையும் காண்க',
        noInternships: 'தற்போது இன்டர்ன்ஷிப்கள் ஏதுமில்லை.',
        new: 'புதியது',
        recommendedScholarships: 'பரிந்துரைக்கப்படும் உதவித்தொகைகள்',
        noScholarships: 'தற்போது உதவித்தொகைகள் ஏதுமில்லை.'
    },
    Hindi: {
        loading: 'डैशबोर्ड लोड हो रहा है...',
        findInternships: 'इंटर्नशिप खोजें',
        findInternshipsDesc: 'अपने अद्वितीय कौशल के अनुकूल इंटर्नशिप खोजें।',
        browseInternships: 'इंटर्नशिप ब्राउज़ करें',
        findScholarships: 'छात्रवृत्ति खोजें',
        findScholarshipsDesc: 'उन छात्रवृत्तियों का अन्वेषण करें जिनके लिए आप योग्य हैं।',
        scholarshipsForYou: 'आपके लिए छात्रवृत्ति',
        topInternships: 'शीर्ष इंटर्नशिप',
        viewAll: 'सभी देखें',
        noInternships: 'फिलहाल कोई इंटर्नशिप नहीं मिली।',
        new: 'नया',
        recommendedScholarships: 'अनुशंसित छात्रवृत्ति',
        noScholarships: 'फिलहाल कोई छात्रवृत्ति नहीं मिली।'
    }
};

export default function Dashboard() {
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [internships, setInternships] = useState<any[]>([]);
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [recentInternships, setRecentInternships] = useState<any[]>([]);
    const [profileTips, setProfileTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            // Fetch with individual error handling to prevent one failure from breaking all
            const fetchWithHandling = async (url: string) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                } catch (e) {
                    console.error(`Failed to fetch ${url}:`, e);
                    return null;
                }
            };

            const [intData, scholData, tipsData] = await Promise.all([
                fetchWithHandling('/api/data/internships'),
                fetchWithHandling('/api/data/scholarships'),
                fetchWithHandling('/api/ai/profile-tips')
            ]);

            const allInts = intData?.internships || [];
            const allSchols = (scholData?.scholarships || []).filter((s: any) => !s.title.toLowerCase().startsWith('top scholarships'));
            if (tipsData) setProfileTips(tipsData.tips || []);

            // Sort by match score for recommendation section
            const recommendedInts = [...allInts].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 4);
            const recommendedSchols = [...allSchols].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 4);

            // Sort by creation date for recent section
            const recentInts = [...allInts].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            }).slice(0, 4);

            setInternships(recommendedInts);
            setScholarships(recommendedSchols);
            setRecentInternships(recentInts);
        } catch (err) {
            console.error('Failed to process dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleItemClick = (item: any, type: 'internship' | 'scholarship') => {
        setSelectedItem({ ...item, type });
        setIsModalOpen(true);
    };

    if (loading) return <div>{t.loading}</div>;

    return (
        <div className="space-y-6">

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-primary to-accent dark:from-slate-800 dark:to-slate-900 border-none text-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                        <Briefcase className="w-8 h-8 text-white dark:text-blue-400" />
                        <h3 className="text-xl font-bold">{t.findInternships}</h3>
                    </div>
                    <p className="text-blue-100 dark:text-gray-400 mb-6">{t.findInternshipsDesc}</p>
                    <Link to="/internships" className="bg-white dark:bg-slate-700 text-primary dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors inline-block">
                        {t.browseInternships}
                    </Link>
                </div>

                <div className="card bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-slate-800 dark:to-slate-900 border-none text-white hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                        <GraduationCap className="w-8 h-8 text-white dark:text-purple-400" />
                        <h3 className="text-xl font-bold">{t.findScholarships}</h3>
                    </div>
                    <p className="text-purple-100 dark:text-gray-400 mb-6">{t.findScholarshipsDesc}</p>
                    <Link to="/scholarships/recommended" className="bg-white dark:bg-slate-700 text-purple-600 dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors inline-block">
                        {t.scholarshipsForYou}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Recent Internships */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-text">{t.topInternships}</h3>
                            {localStorage.getItem('user_location') && (
                                <span className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> Matched for {localStorage.getItem('user_location')}
                                </span>
                            )}
                        </div>
                        <Link to="/internships" className="text-sm text-primary hover:underline">{t.viewAll}</Link>
                    </div>
                    {internships.length === 0 ? (
                        <p className="text-muted">{t.noInternships}</p>
                    ) : (
                        internships.map(job => (
                            <div
                                key={job._id}
                                className="card hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => handleItemClick(job, 'internship')}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-text text-lg truncate group-hover:text-primary transition-colors">{job.title}</h4>
                                        <p className="text-muted font-medium truncate">{job.company}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 ml-4">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">{(job.match_score || 0)}% Match</span>
                                        {job.is_new && <span className="bg-blue-100 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{t.new}</span>}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills_required?.slice(0, 3).map((skill: string) => (
                                            <span key={skill} className="bg-gray-100 dark:bg-gray-800 text-text dark:text-gray-300 text-[10px] px-2 py-0.5 rounded transition-colors font-medium">{skill}</span>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700">{job.source}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Scholarships */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text">{t.recommendedScholarships}</h3>
                        <Link to="/scholarships" className="text-sm text-primary hover:underline">{t.viewAll}</Link>
                    </div>
                    {scholarships.length === 0 ? (
                        <p className="text-muted">{t.noScholarships}</p>
                    ) : (
                        scholarships.map(schol => (
                            <div
                                key={schol._id}
                                className="card hover:border-purple-600/50 transition-colors cursor-pointer group"
                                onClick={() => handleItemClick(schol, 'scholarship')}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-text text-lg truncate group-hover:text-purple-600 transition-colors">{schol.title}</h4>
                                        <p className="text-muted font-medium truncate">{schol.provider?.replace('Aggregator', '').trim()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 ml-4">
                                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">{(schol.match_score || 0)}% Match</span>
                                        {schol.is_new && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold">{t.new}</span>}
                                    </div>
                                </div>
                                <p className="text-sm mt-3 text-muted line-clamp-2">{schol.description}</p>
                                <div className="mt-4 flex justify-end">
                                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700">{schol.source === 'Buddy4Study' ? 'Buddy4Study' : (schol.source || 'Buddy4Study')}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recently Added Section (New Full Width or Grid) */}
                <div className="lg:col-span-2 space-y-4 mt-8">
                    <h3 className="text-lg font-bold text-text">{t.recentlyAdded}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentInternships.length === 0 ? (
                            <p className="text-muted lg:col-span-4">{t.noData}</p>
                        ) : (
                            recentInternships.map(job => (
                                <div
                                    key={`recent-${job._id}`}
                                    className="card hover:border-primary/50 transition-colors cursor-pointer text-sm"
                                    onClick={() => handleItemClick(job, 'internship')}
                                >
                                    <h4 className="font-bold text-text truncate">{job.title}</h4>
                                    <p className="text-muted truncate">{job.company}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="text-xs text-primary font-bold">
                                            {job.location}
                                        </div>
                                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">{job.source}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* INTERNHUB_AI_ASSISTANT: Profile Tips Section */}
            {profileTips.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                        <h2 className="text-xl font-bold text-text">AI Suggestions to Improve Your Profile</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profileTips.map((tip, idx) => (
                            <div key={idx} className="card bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 p-4 relative overflow-hidden group hover:border-amber-400/50 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg mt-0.5">
                                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                                    </div>
                                    <p className="text-sm font-medium text-text">{tip}</p>
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                                    <Sparkles className="w-16 h-16 text-amber-900" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* INTERNHUB_AI_MATCHING: AI Resume-Matched Opportunities */}
            <div className="space-y-4">
                <div className="border-t border-border pt-6">
                    <h2 className="text-xl font-bold text-text mb-6">AI Recommended Opportunities</h2>
                    <AIRecommendations />
                </div>
            </div>

            {/* INTERNHUB_PHASE2_UPDATE: Career Path Recommendations */}
            <div className="space-y-4">
                <div className="border-t border-border pt-6">
                    <h2 className="text-xl font-bold text-text mb-6">Career Path Recommendations</h2>
                    <CareerPath />
                </div>
            </div>

            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedItem}
                type={selectedItem?.type}
            />
        </div>
    );
}
