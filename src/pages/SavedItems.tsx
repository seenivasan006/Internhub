import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, DollarSign, Calendar, Bookmark } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        title: "Saved Items",
        subtitle: "Your bookmarked internships and scholarships.",
        internships: "Internships",
        scholarships: "Scholarships",
        loading: "Loading saved items...",
        noInternships: "No saved internships yet.",
        noScholarships: "No saved scholarships yet.",
        save: "Save",
        saved: "Saved",
        unpaid: "Unpaid / Undisclosed",
        remote: "Remote",
        deadline: "Deadline:",
        apply: "Apply Now",
        detailsMissing: 'Details Missing'
    },
    Tamil: {
        title: "சேமிக்கப்பட்டவை",
        subtitle: "உங்கள் குறிக்கப்பட்ட இன்டர்ன்ஷிப்புகள் மற்றும் உதவித்தொகைகள்.",
        internships: "இன்டர்ன்ஷிப்புகள்",
        scholarships: "உதவித்தொகைகள்",
        loading: "சேமிக்கப்பட்ட உருப்படிகளை ஏற்றுகிறது...",
        noInternships: "இதுவரை சேமிக்கப்பட்ட இன்டர்ன்ஷிப்புகள் இல்லை.",
        noScholarships: "இதுவரை சேமிக்கப்பட்ட உதவித்தொகைகள் இல்லை.",
        save: "சேமி",
        saved: "சேமிக்கப்பட்டது",
        unpaid: "பணம் செலுத்தப்படாதது / வெளியிடப்படவில்லை",
        remote: "தொலைதூர",
        deadline: "காலக்கெடு:",
        apply: "விண்ணப்பிக்கவும்",
        detailsMissing: 'விவரங்கள் இல்லை'
    },
    Hindi: {
        title: "सहेजे गए आइटम",
        subtitle: "आपकी बुकमार्क की गई इंटर्नशिप और छात्रवृत्तियां।",
        internships: "इंटर्नशिप",
        scholarships: "छात्रवृत्तियां",
        loading: "सहेजे गए आइटम लोड हो रहे हैं...",
        noInternships: "अभी तक कोई सहेजी गई इंटर्नशिप नहीं है।",
        noScholarships: "अभी तक कोई सहेजी गई छात्रवृत्ति नहीं है।",
        save: "सहेजें",
        saved: "सहेजा गया",
        unpaid: "अवैतनिक / अज्ञात",
        remote: "रिमोट",
        deadline: "अंतिम तिथि:",
        apply: "आवेदन करें",
        detailsMissing: 'विवरण गायब हैं'
    }
};

export default function SavedItems() {
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [activeTab, setActiveTab] = useState<'internships' | 'scholarships'>('internships');
    const [savedInternships, setSavedInternships] = useState<any[]>([]);
    const [savedScholarships, setSavedScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/profile/saved');
            if (res.ok) {
                const data = await res.json();
                setSavedInternships(data.saved_internships || []);
                setSavedScholarships(data.saved_scholarships || []);
            }
        } catch (err) {
            console.error('Error fetching saved items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const toggleSaveInternship = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/profile/save/internship/${id}`, { method: 'POST' });
            if (res.ok) {
                // If it un-saves successfully, just remove it from the list locally
                setSavedInternships((prev) => prev.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error('Failed to toggle save', err);
        }
    };

    const toggleSaveScholarship = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/profile/save/scholarship/${id}`, { method: 'POST' });
            if (res.ok) {
                // If it un-saves successfully, just remove it from the list locally
                setSavedScholarships((prev) => prev.filter(item => item._id !== id));
            }
        } catch (err) {
            console.error('Failed to toggle save', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                <p className="text-blue-100 mb-6">{t.subtitle}</p>

                {/* Tabs */}
                <div className="flex border-b border-white/20">
                    <button
                        className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'internships' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white'}`}
                        onClick={() => setActiveTab('internships')}
                    >
                        {t.internships} ({savedInternships.length})
                    </button>
                    <button
                        className={`flex-1 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'scholarships' ? 'border-white text-white' : 'border-transparent text-white/70 hover:text-white'}`}
                        onClick={() => setActiveTab('scholarships')}
                    >
                        {t.scholarships} ({savedScholarships.length})
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-muted">{t.loading}</div>
                ) : activeTab === 'internships' ? (
                    savedInternships.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
                            <h3 className="text-xl font-medium text-muted">{t.noInternships}</h3>
                        </div>
                    ) : (
                        savedInternships.map(job => (
                            <div key={job._id} className="card flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-text">{job.title}</h3>
                                        <button
                                            onClick={(e) => toggleSaveInternship(job._id, e)}
                                            className="p-2 rounded-full transition-colors text-primary bg-primary/10"
                                            title={t.saved}
                                        >
                                            <Bookmark className="w-5 h-5" fill="currentColor" />
                                        </button>
                                    </div>
                                    <p className="font-medium text-muted mt-1">{job.company}</p>

                                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
                                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {job.location || t.remote}</div>
                                        <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-gray-400" /> {job.stipend || t.unpaid}</div>
                                        {job.deadline && <div className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" /> {t.deadline} {new Date(job.deadline).toLocaleDateString()}</div>}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-muted text-sm line-clamp-2">{job.description}</p>
                                    </div>
                                </div>
                                <div className="sm:border-l sm:border-border sm:pl-6 flex flex-col justify-center items-center sm:items-end min-w-[140px]">
                                    <a href={job.external_url} target="_blank" rel="noopener noreferrer" className="w-full text-center border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        {t.apply}
                                    </a>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    savedScholarships.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
                            <h3 className="text-xl font-medium text-muted">{t.noScholarships}</h3>
                        </div>
                    ) : (
                        savedScholarships.map(schol => (
                            <div key={schol._id} className="card flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-text">{schol.title}</h3>
                                        <button
                                            onClick={(e) => toggleSaveScholarship(schol._id, e)}
                                            className="p-2 rounded-full transition-colors text-purple-600 bg-purple-100"
                                            title={t.saved}
                                        >
                                            <Bookmark className="w-5 h-5" fill="currentColor" />
                                        </button>
                                    </div>
                                    <p className="font-medium text-muted mt-1">{schol.provider}</p>

                                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted font-medium">
                                        {schol.amount && <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded"><DollarSign className="w-4 h-4 mr-1" /> {schol.amount}</div>}
                                        {schol.deadline && <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded"><Calendar className="w-4 h-4 mr-1" /> {t.deadline} {new Date(schol.deadline).toLocaleDateString()}</div>}
                                    </div>
                                </div>
                                <div className="sm:border-l sm:border-border sm:pl-6 flex flex-col justify-center items-center min-w-[140px]">
                                    {schol.official_website || schol.external_url ? (
                                        <a href={schol.official_website || schol.external_url} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-purple-600 text-white hover:bg-purple-700 px-4 py-3 rounded-lg font-bold shadow-sm transition-all hover:shadow-md">
                                            {t.apply}
                                        </a>
                                    ) : (
                                        <button disabled className="w-full text-center bg-gray-200 text-muted px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                                            {t.detailsMissing}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
