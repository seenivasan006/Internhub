import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PenTool, Copy, Check } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        title: "AI Essay Generator",
        scholarshipName: "Scholarship Name / Provider",
        scholarshipPlaceholder: "e.g. Google Women Techmakers",
        topic: "Essay Topic / Prompt",
        topicPlaceholder: "e.g. Describe a time you overcame a technical challenge...",
        wordLimit: "Word Limit",
        words250: "250 words",
        words500: "500 words",
        words750: "750 words",
        words1000: "1000 words",
        tone: "Tone",
        professional: "Professional",
        passionate: "Passionate",
        academic: "Academic",
        storytelling: "Storytelling",
        generating: "🤖 Generating Magic...",
        generateBtn: "Generate Essay",
        outputTitle: "Generated Output",
        copied: "Copied",
        copy: "Copy",
        crafting: "Crafting your essay...",
        fillForm: "Fill out the form and click generate to create your personalized essay.",
        quotaError: "The AI is currently busy. Please wait {n} seconds before trying again.",
        generalQuota: "AI service limit reached. Please try again in a moment."
    },
    Tamil: {
        title: "AI கட்டுரை உருவாக்கி",
        scholarshipName: "உதவித்தொகை பெயர் / வழங்குநர்",
        scholarshipPlaceholder: "எ.கா. Google Women Techmakers",
        topic: "கட்டுரை தலைப்பு",
        topicPlaceholder: "எ.கா. நீங்கள் ஒரு சவாலை எதிர்கொண்ட நேரத்தை விவரிக்கவும்...",
        wordLimit: "வார்த்தை வரம்பு",
        words250: "250 வார்த்தைகள்",
        words500: "500 வார்த்தைகள்",
        words750: "750 வார்த்தைகள்",
        words1000: "1000 வார்த்தைகள்",
        tone: "தொனி",
        professional: "தொழில்முறை",
        passionate: "ஆர்வமுள்ள",
        academic: "கல்வி சார்ந்த",
        storytelling: "கதை சொல்லும்",
        generating: "🤖 மாயாஜாலம் உருவாகிறது...",
        generateBtn: "கட்டுரையை உருவாக்கு",
        outputTitle: "உருவாக்கப்பட்ட வெளியீடு",
        copied: "நகலெடுக்கப்பட்டது",
        copy: "நகலெடு",
        crafting: "உங்கள் கட்டுரையை உருவாக்குகிறது...",
        fillForm: "உங்கள் தனிப்பயனாக்கப்பட்ட கட்டுரையை உருவாக்க படிவத்தை பூர்த்தி செய்து உருவாக்கு என்பதைக் கிளிக் செய்யவும்.",
        quotaError: "AI தற்போது பிஸியாக உள்ளது. மீண்டும் முயற்சிக்கும் முன் {n} வினாடிகள் காத்திருக்கவும்.",
        generalQuota: "AI சேவை வரம்பை எட்டியது. சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்."
    },
    Hindi: {
        title: "एआई निबंध जनरेटर",
        scholarshipName: "छात्रवृत्ति का नाम / प्रदाता",
        scholarshipPlaceholder: "उदा. Google Women Techmakers",
        topic: "निबंध का विषय / संकेत",
        topicPlaceholder: "उदा. उस समय का वर्णन करें जब आपने किसी चुनौती का सामना किया...",
        wordLimit: "शब्द सीमा",
        words250: "250 शब्द",
        words500: "500 शब्द",
        words750: "750 शब्द",
        words1000: "1000 शब्द",
        tone: "स्वर",
        professional: "पेशेवर",
        passionate: "भावुक",
        academic: "शैक्षणिक",
        storytelling: "कहानी सुनाना",
        generating: "🤖 जादू उत्पन्न हो रहा है...",
        generateBtn: "निबंध उत्पन्न करें",
        outputTitle: "उत्पन्न आउटपुट",
        copied: "कॉपी किया गया",
        copy: "कॉपी करें",
        crafting: "आपका निबंध तैयार किया जा रहा है...",
        fillForm: "अपना व्यक्तिगत निबंध बनाने के लिए फॉर्म भरें और जेनरेट पर क्लिक करें।",
        quotaError: "एआई अभी व्यस्त है। कृपया पुनः प्रयास करने से पहले {n} सेकंड प्रतीक्षा करें।",
        generalQuota: "एआई सेवा सीमा समाप्त। कृपया कुछ देर बाद पुनः प्रयास करें।"
    }
};

export default function EssayGenerator() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [formData, setFormData] = useState({
        scholarshipName: '',
        topic: '',
        wordLimit: '500',
        tone: 'Professional'
    });
    const [loading, setLoading] = useState(false);
    const [essay, setEssay] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [retryTime, setRetryTime] = useState(0);

    // Countdown effect for rate limits
    useEffect(() => {
        if (retryTime <= 0) return;
        const timer = setInterval(() => {
            setRetryTime(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [retryTime]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setEssay('');
        setError('');
        setCopied(false);

        try {
            const res = await fetch('/api/ai/generate-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scholarshipTitle: formData.scholarshipName,
                    careerGoals: formData.topic, // Topic is used as goals in this context
                    background: user?.location + ', ' + (user?.education_level || '') + ', Skills: ' + (user?.skills || []).join(', ')
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEssay(data.essay);
            } else {
                console.error('Server Error:', data);
                const msg = (data.error || '').toLowerCase();
                const isQuotaError = data.retryAfter || res.status === 429 || msg.includes('quota') || msg.includes('limit');

                if (isQuotaError) {
                    if (data.retryAfter) {
                        setRetryTime(data.retryAfter);
                        setError(t.quotaError.replace('{n}', data.retryAfter));
                    } else {
                        setError(t.generalQuota);
                    }
                } else {
                    setError(data.error || 'Server error occurred while generating essay');
                }
            }
        } catch (err: any) {
            console.error('Fetch Error:', err);
            setError(`Connection Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(essay);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Input Form */}
            <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <PenTool className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-text">{t.title}</h2>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-text">{t.scholarshipName}</label>
                        <input
                            type="text"
                            required
                            value={formData.scholarshipName}
                            onChange={e => setFormData({ ...formData, scholarshipName: e.target.value })}
                            className="input-field mt-1"
                            placeholder={t.scholarshipPlaceholder}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text">{t.topic}</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.topic}
                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            className="input-field mt-1"
                            placeholder={t.topicPlaceholder}
                        />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text">{t.wordLimit}</label>
                            <select
                                value={formData.wordLimit}
                                onChange={e => setFormData({ ...formData, wordLimit: e.target.value })}
                                className="input-field mt-1"
                            >
                                <option value="250">{t.words250}</option>
                                <option value="500">{t.words500}</option>
                                <option value="750">{t.words750}</option>
                                <option value="1000">{t.words1000}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text">{t.tone}</label>
                            <select
                                value={formData.tone}
                                onChange={e => setFormData({ ...formData, tone: e.target.value })}
                                className="input-field mt-1"
                            >
                                <option value="Professional">{t.professional}</option>
                                <option value="Passionate">{t.passionate}</option>
                                <option value="Academic">{t.academic}</option>
                                <option value="Storytelling">{t.storytelling}</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || retryTime > 0}
                        className={`w-full btn-primary py-3 mt-4 text-lg ${retryTime > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? t.generating : (retryTime > 0 ? `${t.generateBtn} (${retryTime}s)` : t.generateBtn)}
                    </button>
                </form>
            </div>

            {/* Output Display */}
            <div className="card bg-muted/10 flex flex-col h-full min-h-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text">{t.outputTitle}</h2>
                    {essay && (
                        <button
                            onClick={handleCopy}
                            className="flex items-center text-sm font-medium text-muted hover:text-primary transition-colors bg-card px-3 py-1.5 border border-border rounded-md shadow-sm"
                        >
                            {copied ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copied ? t.copied : t.copy}
                        </button>
                    )}
                </div>

                <div className="flex-1 bg-card border border-border rounded-lg p-6 overflow-y-auto w-full prose prose-blue">
                    {loading ? (
                        <div className="h-full flex flex-col justify-center items-center text-gray-400 space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p>{t.crafting}</p>
                        </div>
                    ) : essay ? (
                        <div className="whitespace-pre-wrap text-text leading-relaxed font-serif">
                            {essay}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-gray-400 text-center">
                            <p>{t.fillForm}</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
