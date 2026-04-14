import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, Calendar, Flame, Bookmark } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        title: 'Scholarships For You',
        subtitle: 'Intelligently ranked based on your profile details.',
        analyzing: 'Analyzing your profile & finding the best matches...',
        noScholarships: 'No scholarships open right now. Check back later!',
        match: 'Match',
        deadline: 'Deadline:',
        applyNow: 'Apply Now',
        detailsMissing: 'Details Missing',
        save: "Save",
        saved: "Saved"
    },
    Tamil: {
        title: 'உங்களுக்கான உதவித்தொகைகள்',
        subtitle: 'உங்கள் சுயவிவர விவரங்களின் அடிப்படையில் தரப்படுத்தப்பட்டுள்ளன.',
        analyzing: 'உங்கள் சுயவிவரத்தை பகுப்பாய்வு செய்து சிறந்த பொருத்தங்களைக் கண்டறிகிறது...',
        noScholarships: 'தற்போது திறந்த உதவித்தொகைகள் எதுவும் இல்லை. பின்னர் மீண்டும் சரிபார்க்கவும்!',
        match: 'பொருத்தம்',
        deadline: 'காலக்கெடு:',
        applyNow: 'இப்போதே விண்ணப்பிக்கவும்',
        detailsMissing: 'விவரங்கள் இல்லை',
        save: "சேமி",
        saved: "சேமிக்கப்பட்டது"
    },
    Hindi: {
        title: 'आपके लिए छात्रवृत्ति',
        subtitle: 'आपके प्रोफ़ाइल विवरण के आधार पर बुद्धिमानी से रैंक किया गया।',
        analyzing: 'आपकी प्रोफ़ाइल का विश्लेषण और सर्वोत्तम मिलान खोज रहे हैं...',
        noScholarships: 'फिलहाल कोई छात्रवृत्ति नहीं है। बाद में वापस आएं!',
        match: 'मिलान',
        deadline: 'अंतिम तिथि:',
        applyNow: 'अभी आवेदन करें',
        detailsMissing: 'विवरण गायब हैं',
        save: "सहेजें",
        saved: "सहेजा गया"
    }
};

export default function RecommendedScholarships() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedScholarships, setSavedScholarships] = useState<string[]>([]);

    useEffect(() => {
        if (!user?._id) return;

        const fetchRecommended = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/data/scholarships/recommended/${user._id}`);
                const data = await res.json();
                setScholarships(data.scholarships || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

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

        fetchRecommended();
        fetchSaved();
    }, [user]);

    const toggleSave = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
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

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                <p className="text-purple-100">{t.subtitle}</p>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-muted">{t.analyzing}</div>
                ) : scholarships.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border border-border shadow-sm">
                        <h3 className="text-xl font-medium text-muted">{t.noScholarships}</h3>
                    </div>
                ) : (
                    scholarships.map(schol => (
                        <div key={schol._id} className="card flex flex-col sm:flex-row gap-6 hover:border-purple-300 transition-all shadow-sm">

                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-xl font-bold text-text">{schol.title}</h3>

                                            {/* AI Match Badge */}
                                            {schol.match_score >= 80 && (
                                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200 flex items-center shadow-sm">
                                                    <Flame className="w-3 h-3 mr-1" />
                                                    {schol.match_score}% {t.match}
                                                </span>
                                            )}
                                            {schol.match_score >= 50 && schol.match_score < 80 && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                                    {schol.match_score}% {t.match}
                                                </span>
                                            )}

                                        </div>
                                        <p className="font-medium text-muted mt-1">{schol.provider}</p>
                                    </div>
                                    <button
                                        onClick={(e) => toggleSave(schol._id, e)}
                                        className={`p-2 rounded-full transition-colors ml-4 h-10 w-10 flex items-center justify-center ${savedScholarships.includes(schol._id) ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'}`}
                                        title={savedScholarships.includes(schol._id) ? t.saved : t.save}
                                    >
                                        <Bookmark className="w-5 h-5" fill={savedScholarships.includes(schol._id) ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted font-medium">
                                    {schol.amount && (
                                        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                                            <DollarSign className="w-4 h-4 mr-1" /> {schol.amount}
                                        </div>
                                    )}
                                    {schol.deadline && (
                                        <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                                            <Calendar className="w-4 h-4 mr-1" /> {t.deadline} {new Date(schol.deadline).toLocaleDateString()}
                                        </div>
                                    )}
                                    {schol.education_level && (
                                        <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                            {schol.education_level}
                                        </div>
                                    )}
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
                                        href={schol.official_website || schol.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
