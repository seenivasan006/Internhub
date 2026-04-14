import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, DollarSign, Calendar, Bookmark } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { DetailModal } from '../components/DetailModal';
import { ensureAbsoluteUrl } from '../utils/url';

const translations: Record<string, any> = {
    English: {
        title: "Find Your Next Internship",
        subtitle: "Powered by real-time sync with public job boards. Ranked intelligently based on your skills map.",
        searchPlaceholder: "Search by title, company, or keywords...",
        locationPlaceholder: "City, State, or 'Remote'",
        searchBtn: "Search",
        loading: "Loading internships...",
        noResults: "No internships found",
        tryAdjusting: "Try adjusting your search criteria",
        apply: "Apply Now",
        skills: "Skills:",
        via: "Via",
        remote: "Remote",
        unpaid: "Unpaid / Undisclosed",
        deadline: "Deadline:",
        new: "New",
        skillMatch: "SKILL MATCH",
        save: "Save",
        saved: "Saved"
    },
    Tamil: {
        title: "உங்கள் அடுத்த இன்டர்ன்ஷிப்பை தேடுங்கள்",
        subtitle: "பொது வேலை வாய்ப்பு தளங்களுடன் நிகழ்நேர ஒத்திசைவு. உங்கள் திறன்களின் அடிப்படையில் தரவரிசைப்படுத்தப்பட்டுள்ளது.",
        searchPlaceholder: "தலைப்பு, நிறுவனம் அல்லது முக்கிய சொற்களை தேடவும்...",
        locationPlaceholder: "இடம் (எகா: சென்னை, Remote)",
        searchBtn: "தேடு",
        loading: "ஏற்றுகிறது...",
        noResults: "முடிவுகள் எதுவும் இல்லை",
        tryAdjusting: "உங்கள் தேடலை மாற்ற முயற்சிக்கவும்",
        apply: "விண்ணப்பிக்கவும்",
        skills: "திறன்கள்:",
        via: "வழியாக",
        remote: "தொலைதூர",
        unpaid: "பணம் செலுத்தப்படாதது / வெளியிடப்படவில்லை",
        deadline: "காலக்கெடு:",
        new: "புதியது",
        skillMatch: "திறன் பொருத்தம்",
        save: "சேமி",
        saved: "சேமிக்கப்பட்டது"
    },
    Hindi: {
        title: "अपनी अगली इंटर्नशिप खोजें",
        subtitle: "वास्तविक समय सिंक द्वारा संचालित। आपके कौशल के आधार पर बुद्धिमानी से रैंक किया गया।",
        searchPlaceholder: "शीर्षक, कंपनी या कीवर्ड द्वारा खोजें...",
        locationPlaceholder: "स्थान (शहर, राज्य या 'Remote')",
        searchBtn: "खोजें",
        loading: "इंटर्नशिप लोड हो रही हैं...",
        noResults: "कोई इंटर्नशिप नहीं मिली",
        tryAdjusting: "अपना खोज मानदंड बदलें",
        apply: "अभी आवेदन करें",
        skills: "कौशल:",
        via: "माध्यम",
        remote: "रिमोट",
        unpaid: "अवैतनिक / अज्ञात",
        deadline: "अंतिम तिथि:",
        new: "नया",
        skillMatch: "कौशल मिलान",
        save: "सहेजें",
        saved: "सहेजा गया"
    }
};

export default function InternshipSearch() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [internships, setInternships] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [savedInternships, setSavedInternships] = useState<string[]>([]);

    // Detail Modal State
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInternships = async (searchQuery = '', searchLoc = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('query', searchQuery);
            if (searchLoc) params.append('location', searchLoc);

            let res = await fetch(`/api/data/internships?${params.toString()}`);
            let data = await res.json();

            // Fallback: If location-specific search returns zero, try general search
            if ((!data.internships || data.internships.length === 0) && searchLoc) {
                const fallbackParams = new URLSearchParams();
                if (searchQuery) fallbackParams.append('query', searchQuery);
                res = await fetch(`/api/data/internships?${fallbackParams.toString()}`);
                data = await res.json();
            }

            setInternships(data.internships || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships('', user?.location || '');

        // Fetch user's saved items to highlight the bookmark icons
        const fetchSaved = async () => {
            try {
                const res = await fetch('/api/profile/saved');
                if (res.ok) {
                    const data = await res.json();
                    setSavedInternships(data.saved_internships.map((i: any) => i._id || i));
                }
            } catch (err) {
                console.error('Error fetching saved:', err);
            }
        };
        fetchSaved();

        // Pre-fill location filter with user location if available
        if (user?.location) setLocation(user.location);

        // Auto refresh matching real data polling every 30s
        const interval = setInterval(() => fetchInternships(query, location), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchInternships(query, location);
    };

    const toggleSave = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch(`/api/profile/save/internship/${id}`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setSavedInternships(data.saved_internships);
            }
        } catch (err) {
            console.error('Failed to toggle save', err);
        }
    };

    const openDetail = (job: any) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <DetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedJob}
                type="internship"
            />

            <div className="card bg-primary text-white">
                <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                <p className="text-blue-100 mb-6">{t.subtitle}</p>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-card text-text border border-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                        />
                    </div>
                    <div className="relative flex-1 sm:max-w-xs">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.locationPlaceholder}
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-card text-text border border-transparent focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                        />
                    </div>
                    <button type="submit" className="bg-card dark:bg-gray-800 text-primary dark:text-blue-400 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        {t.searchBtn}
                    </button>
                </form>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-muted">{t.loading}</div>
                ) : internships.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border">
                        <h3 className="text-xl font-medium text-muted">{t.noResults}</h3>
                        <p className="text-muted mt-2">{t.tryAdjusting}</p>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => { setQuery(''); setLocation(''); fetchInternships('', ''); }} className="text-primary hover:underline font-medium">Clear All Filters</button>
                            <button onClick={() => { fetchInternships('', ''); }} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">Show All Internships</button>
                        </div>
                    </div>
                ) : (
                    internships.map(job => (
                        <div
                            key={job._id}
                            onClick={(e) => {
                                if ((e.target as HTMLElement).closest('button, a')) return;
                                openDetail(job);
                            }}
                            className="card flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${job.match_score >= 70 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {job.match_score || 0}% Match
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-medium text-muted">{job.company}</p>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{job.source}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {job.is_new && <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">{t.new}</span>}
                                        <button
                                            onClick={(e) => toggleSave(job._id, e)}
                                            className={`p-2 rounded-full transition-colors ${savedInternships.includes(job._id) ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-gray-100'}`}
                                            title={savedInternships.includes(job._id) ? t.saved : t.save}
                                        >
                                            <Bookmark className="w-5 h-5" fill={savedInternships.includes(job._id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
                                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {job.location || t.remote}</div>
                                    <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-gray-400" /> {job.stipend || t.unpaid}</div>
                                    {job.deadline && <div className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> {t.deadline} {new Date(job.deadline).toLocaleDateString()}</div>}
                                </div>

                                <div className="mt-4">
                                    <p className="text-muted text-sm line-clamp-2">{job.description}</p>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 items-center">
                                    <span className="text-xs font-semibold text-muted mr-2">{t.skills}</span>
                                    {job.skills_required?.slice(0, 5).map((skill: string) => {
                                        // Highlight if user has this skill
                                        const hasSkill = user?.skills.some(s => s.toLowerCase() === skill.toLowerCase());
                                        return (
                                            <span
                                                key={skill}
                                                className={`text-xs px-2 py-1 rounded ${hasSkill ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-muted dark:text-gray-300'}`}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="sm:border-l sm:border-border sm:pl-6 flex flex-col justify-center items-center sm:items-end min-w-[140px]">
                                <a
                                    href={ensureAbsoluteUrl(job.external_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-center border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    {t.apply}
                                </a>
                            </div>

                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
