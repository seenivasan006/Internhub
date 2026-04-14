import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Filter, Bookmark, Search, DollarSign, Calendar } from 'lucide-react';
import { DetailModal } from '../components/DetailModal';
import { ensureAbsoluteUrl } from '../utils/url';

const translations: Record<string, any> = {
    English: {
        title: 'Find Scholarships',
        subtitle: 'Discover scholarships intelligently matched to your profile and eligibility.',
        searchPlaceholder: 'Search providers or title...',
        filters: 'Filters',
        searchBtn: 'Search',
        eduLevel: 'Education Level',
        allLevels: 'All Levels',
        highSchool: 'High School',
        ug: 'Undergraduate',
        pg: 'Postgraduate',
        phd: 'PhD',
        state: 'State',
        statePlaceholder: 'e.g. Maharashtra',
        community: 'Community',
        allCategories: 'All Categories',
        general: 'General',
        minority: 'Minority',
        familyIncome: 'Family Income (₹)',
        maxIncome: 'Max Income',
        openOnly: 'Only show currently open scholarships',
        loading: 'Loading matched scholarships...',
        noResults: 'No scholarships found for these criteria.',
        clearFilters: 'Clear Filters',
        highMatch: 'High Match',
        deadline: 'Deadline:',
        applyNow: 'Apply Now',
        detailsMissing: 'Details Missing',
        save: "Save",
        saved: "Saved"
    },
    Tamil: {
        title: 'உதவித்தொகைகளைக் கண்டறியவும்',
        subtitle: 'உங்கள் சுயவிவரம் மற்றும் தகுதிகளுக்கு ஏற்ப புத்திசாலித்தனமாக பொருந்தக்கூடிய உதவித்தொகைகளைக் கண்டறியவும்.',
        searchPlaceholder: 'வழங்குநர்கள் அல்லது தலைப்பைத் தேடுங்கள்...',
        filters: 'வடிப்பான்கள்',
        searchBtn: 'தேடு',
        eduLevel: 'கல்வி நிலை',
        allLevels: 'அனைத்து நிலைகளும்',
        highSchool: 'உயர்நிலைப் பள்ளி',
        ug: 'இளங்கலை',
        pg: 'முதுகலை',
        phd: 'முனைவர் பட்டம்',
        state: 'மாநிலம்',
        statePlaceholder: 'எ.கா. தமிழ்நாடு',
        community: 'சமூகம்',
        allCategories: 'அனைத்து பிரிவுகளும்',
        general: 'பொதுவானவை',
        minority: 'சிறுபான்மையினர்',
        familyIncome: 'குடும்ப வருமானம் (₹)',
        maxIncome: 'அதிகபட்ச வருமானம்',
        openOnly: 'தற்போது திறந்திருக்கும் உதவித்தொகைகளை மட்டும் காட்டு',
        loading: 'பொருத்தமான உதவித்தொகைகளை ஏற்றுகிறது...',
        noResults: 'இந்த நிபந்தனைகளுக்கு உதவித்தொகைகள் எதுவும் கிடைக்கவில்லை.',
        clearFilters: 'வடிப்பான்களை அகற்று',
        highMatch: 'மிகவும் பொருத்தமானது',
        deadline: 'காலக்கெடு:',
        applyNow: 'இப்போதே விண்ணப்பிக்கவும்',
        detailsMissing: 'விவரங்கள் இல்லை',
        save: "சேமி",
        saved: "சேமிக்கப்பட்டது"
    },
    Hindi: {
        title: 'छात्रवृत्ति खोजें',
        subtitle: 'विद्वानों को अपने प्रोफ़ाइल और योग्यता के अनुसार बुद्धिमानी से मिलान करें।',
        searchPlaceholder: 'प्रदाता या शीर्षक खोजें...',
        filters: 'फ़िल्टर',
        searchBtn: 'खोजें',
        eduLevel: 'शिक्षा स्तर',
        allLevels: 'सभी स्तर',
        highSchool: 'हाई स्कूल',
        ug: 'स्नातक',
        pg: 'स्नातकोत्तर',
        phd: 'पीएचडी',
        state: 'राज्य',
        statePlaceholder: 'जैसे महाराष्ट्र',
        community: 'समुदाय',
        allCategories: 'सभी श्रेणियाँ',
        general: 'सामान्य',
        minority: 'अल्पसंख्यक',
        familyIncome: 'पारिवारिक आय (₹)',
        maxIncome: 'अधिकतम आय',
        openOnly: 'केवल वर्तमान में खुली छात्रवृत्तियां दिखाएं',
        loading: 'मिलान छात्रवृत्ति लोड हो रही है...',
        noResults: 'इन मानदंडों के लिए कोई छात्रवृत्ति नहीं मिली।',
        clearFilters: 'फ़िल्टर साफ़ करें',
        highMatch: 'उच्च मिलान',
        deadline: 'अंतिम तिथि:',
        applyNow: 'अभी आवेदन करें',
        detailsMissing: 'विवरण गायब हैं',
        save: "सहेजें",
        saved: "सहेजा गया"
    }
};

export default function ScholarshipSearch() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [scholarships, setScholarships] = useState<any[]>([]);
    const [query, setQuery] = useState('');

    // Filters
    const [educationLevel, setEducationLevel] = useState('');
    const [stateLocation, setStateLocation] = useState('');
    const [community, setCommunity] = useState('');
    const [income, setIncome] = useState('');
    const [openOnly, setOpenOnly] = useState(true);

    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savedScholarships, setSavedScholarships] = useState<string[]>([]);

    // Detail Modal State
    const [selectedSchol, setSelectedSchol] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchScholarships = async (
        searchQuery = query,
        ed = educationLevel,
        st = stateLocation,
        comm = community,
        inc = income,
        open = openOnly
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (ed) params.append('education_level', ed);
            if (st) params.append('state', st);
            if (comm) params.append('community', comm);
            if (inc) params.append('income', inc);
            if (open) params.append('open_only', 'true');

            let res = await fetch(`/api/data/scholarships?${params.toString()}`);
            let data = await res.json();

            // Fallback: If filtered results are zero, try a broader search (title/provider query only)
            if ((!data.scholarships || data.scholarships.length === 0) && (ed || st || comm || inc || open)) {
                const broadParams = new URLSearchParams();
                if (searchQuery) broadParams.append('query', searchQuery);
                res = await fetch(`/api/data/scholarships?${broadParams.toString()}`);
                data = await res.json();
            }

            const filtered = (data.scholarships || []).filter((s: any) => !s.title.toLowerCase().startsWith('top scholarships'));
            setScholarships(filtered);
            return filtered;
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch based on user profile if available, else general fetch
    useEffect(() => {
        if (user) {
            if (user.education_level && !educationLevel) setEducationLevel(user.education_level);
            if (user.state && !stateLocation) setStateLocation(user.state);
            if (user.community && !community) setCommunity(user.community);
            if (user.income && !income) setIncome(user.income.toString());
        }

        const fetchSaved = async () => {
            try {
                const res = await fetch('/api/profile/saved');
                if (res.ok) {
                    const data = await res.json();
                    setSavedScholarships(data.saved_scholarships.map((i: any) => i._id || i));
                }
            } catch (err) {
                console.error('Error fetching saved:', err);
            }
        };
        fetchSaved();

        // Use a short timeout to let the state update if user object just loaded
        const timer = setTimeout(() => {
            fetchScholarships();
        }, 100);

        return () => clearTimeout(timer);
    }, [user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchScholarships();
    };

    const toggleSave = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`/api/profile/save/scholarship/${id}`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSavedScholarships(data.saved_scholarships);
            }
        } catch (err) {
            console.error('Failed to toggle save', err);
        }
    };

    const openDetail = (schol: any) => {
        setSelectedSchol(schol);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedSchol}
                type="scholarship"
            />

            <div className="card bg-purple-600 dark:bg-card text-white">
                <h2 className="text-2xl font-bold mb-2 text-white dark:text-purple-400">{t.title}</h2>
                <p className="text-purple-100 dark:text-gray-400 mb-6">{t.subtitle}</p>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
                            />
                        </div>
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className="bg-purple-500 dark:bg-purple-900/50 text-white dark:text-purple-300 px-4 py-3 rounded-lg hover:bg-purple-400 dark:hover:bg-purple-800/80 flex items-center gap-2 transition-colors">
                            <Filter className="w-5 h-5" />
                            <span className="hidden sm:inline">{t.filters}</span>
                        </button>
                        <button type="submit" className="bg-white dark:bg-purple-600 text-purple-600 dark:text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-700 transition-colors">
                            {t.searchBtn}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-purple-500/50">
                            <div>
                                <label className="block text-xs text-purple-200 mb-1">{t.eduLevel}</label>
                                <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full p-2 rounded text-text text-sm">
                                    <option value="">{t.allLevels}</option>
                                    <option value="High School">{t.highSchool}</option>
                                    <option value="UG">{t.ug}</option>
                                    <option value="PG">{t.pg}</option>
                                    <option value="PhD">{t.phd}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-purple-200 mb-1">{t.state}</label>
                                <input type="text" placeholder={t.statePlaceholder} value={stateLocation} onChange={e => setStateLocation(e.target.value)} className="w-full p-2 rounded text-text text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-purple-200 mb-1">{t.community}</label>
                                <select value={community} onChange={e => setCommunity(e.target.value)} className="w-full p-2 rounded text-text text-sm">
                                    <option value="">{t.allCategories}</option>
                                    <option value="General">{t.general}</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="Minority">{t.minority}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-purple-200 mb-1">{t.familyIncome}</label>
                                <input type="number" placeholder={t.maxIncome} value={income} onChange={e => setIncome(e.target.value)} className="w-full p-2 rounded text-text text-sm" />
                            </div>
                            <div className="col-span-full flex items-center gap-2 mt-2">
                                <input type="checkbox" id="openOnly" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                                <label htmlFor="openOnly" className="text-sm font-medium text-white">{t.openOnly}</label>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-muted">{t.loading}</div>
                ) : scholarships.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
                        <h3 className="text-xl font-medium text-muted">{t.noResults}</h3>
                        <p className="text-muted mt-2">Try clearing your filters or viewing all scholarships.</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => { setEducationLevel(''); setStateLocation(''); setCommunity(''); setIncome(''); setQuery(''); setOpenOnly(false); fetchScholarships('', '', '', '', '', false); }} className="text-purple-600 hover:underline font-medium">{t.clearFilters}</button>
                            <button onClick={() => { fetchScholarships('', '', '', '', '', false); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">Show All Scholarships</button>
                        </div>
                    </div>
                ) : (
                    scholarships.map(schol => (
                        <div
                            key={schol._id}
                            onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button, a')) return;
                                openDetail(schol);
                            }}
                            className="card flex flex-col sm:flex-row gap-6 hover:border-purple-300 transition-all shadow-sm cursor-pointer group"
                        >

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-text">{schol.title}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${schol.match_score >= 70 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {schol.match_score}% Match
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-medium text-muted">{schol.provider?.replace('Aggregator', '').trim()}</p>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">{schol.source || 'Buddy4Study'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => toggleSave(schol._id, e)}
                                        className={`p-2 rounded-full transition-colors ml-4 ${savedScholarships.includes(schol._id) ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'}`}
                                        title={savedScholarships.includes(schol._id) ? t.saved : t.save}
                                    >
                                        <Bookmark className="w-5 h-5" fill={savedScholarships.includes(schol._id) ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted font-medium">
                                    {schol.amount && <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded"><DollarSign className="w-4 h-4 mr-1" /> {schol.amount}</div>}
                                    {schol.deadline && <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded"><Calendar className="w-4 h-4 mr-1" /> {t.deadline} {new Date(schol.deadline).toLocaleDateString()}</div>}
                                    {schol.education_level && <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded border border-blue-100 dark:border-blue-800/50">{schol.education_level}</div>}
                                    {schol.community && <div className="flex items-center text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded border border-orange-100 dark:border-orange-800/50">{schol.community}</div>}
                                </div>

                                {schol.description && (
                                    <div className="mt-4">
                                        <p className="text-muted text-sm whitespace-pre-wrap">{schol.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="sm:border-l sm:border-border sm:pl-6 flex flex-col justify-center items-center min-w-[140px]">
                                {schol.official_website || schol.external_url ? (
                                    <a
                                        href={ensureAbsoluteUrl(schol.official_website || schol.external_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full text-center bg-purple-600 text-white hover:bg-purple-700 px-4 py-3 rounded-lg font-bold shadow-sm transition-all hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        {t.applyNow}
                                    </a>
                                ) : (
                                    <button disabled className="w-full text-center bg-gray-200 text-muted px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                                        {t.detailsMissing}
                                    </button>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
