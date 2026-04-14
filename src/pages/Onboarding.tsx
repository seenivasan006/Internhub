import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Briefcase, GraduationCap, Layers, Eye, EyeOff } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        welcomeTitle: 'Welcome to InternHub!',
        welcomeDesc: "Let's personalize your experience.",
        logout: 'Logout',
        lookingFor: 'What are you looking for?',
        internships: 'Internships',
        scholarships: 'Scholarships',
        both: 'Both',
        nextBtn: 'Next',
        backBtn: 'Back',
        internshipPref: 'Internship Preferences',
        collegeCompany: 'College or Company Name',
        collegeCompanyDesc: 'Where do you study or work?',
        degree: 'Degree',
        degreeDesc: 'e.g. B.Tech Computer Science',
        skills: 'Your Skills (comma separated)',
        skillsDesc: 'e.g. React, Python, Java',
        resume: 'Resume Link (Google Drive / Online PDF) [Optional]',
        resumeDesc: 'https://drive.google.com/...',
        scholarshipDetails: 'Scholarship Details',
        geoLoc: 'Geographic Location',
        detectLoc: 'Detect My Location',
        detecting: 'Detecting...',
        city: 'City / District',
        state: 'State',
        eduLevel: 'Education Level',
        community: 'Community',
        familyIncome: 'Family Income (Annual ₹)',
        familyIncomeDesc: 'e.g. 120000',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        finalStep: 'Final Step',
        prefLang: 'Preferred System Language',
        createPwd: 'Create a Password (Google Auto-Login)',
        createPwdDesc: 'Since you signed in with Google, you can set a password now to sign in with email/password directly in the future.',
        pwdPlaceholder: 'Enter password (optional)',
        saving: 'Saving...',
        completeOnboarding: 'Complete Onboarding',
        religion: 'Religion',
        marks: 'Academic Marks (%)',
        marksDesc: 'e.g. 85',
        companyType: 'Preferred Company Type',
        minStipend: 'Min. Stipend (Expected ₹)',
        duration: 'Preferred Duration (Months)',
        mnc: 'MNC',
        startup: 'Startup',
        newVenture: 'New Venture',
        prefLocation: 'Preferred Internship Location',
        prefLocationDesc: 'e.g. Chennai, Remote, Bangalore',
        any: 'Any'
    },
    Tamil: {
        welcomeTitle: 'InternHub-க்கு வரவேற்கிறோம்!',
        welcomeDesc: "உங்கள் அனுபவத்தை தனிப்பயனாக்குவோம்.",
        logout: 'வெளியேறு',
        lookingFor: 'நீங்கள் எதைத் தேடுகிறீர்கள்?',
        internships: 'இன்டர்ன்ஷிப்கள்',
        scholarships: 'உதவித்தொகைகள்',
        both: 'இரண்டும்',
        nextBtn: 'அடுத்து',
        backBtn: 'பின்புறம்',
        internshipPref: 'இன்டர்ன்ஷிப் விருப்பங்கள்',
        collegeCompany: 'கல்லூரி அல்லது நிறுவனத்தின் பெயர்',
        collegeCompanyDesc: 'நீங்கள் எங்கு படிக்கிறீர்கள் அல்லது வேலை செய்கிறீர்கள்?',
        degree: 'பட்டம்',
        degreeDesc: 'எ.கா. B.Tech Computer Science',
        skills: 'உங்கள் திறன்கள் (காற்புள்ளிகளுடன்)',
        skillsDesc: 'எ.கா. React, Python, Java',
        resume: 'ரெஸ்யூம் இணைப்பு (Google Drive) [விருப்பப்படி]',
        resumeDesc: 'https://drive.google.com/...',
        scholarshipDetails: 'உதவித்தொகை விவரங்கள்',
        geoLoc: 'புவியியல் இருப்பிடம்',
        detectLoc: 'எனது இருப்பிடத்தைக் கண்டறி',
        detecting: 'கண்டறியப்படுகிறது...',
        city: 'நகரம் / மாவட்டம்',
        state: 'மாநிலம்',
        eduLevel: 'கல்வி நிலை',
        community: 'சமூகம்',
        familyIncome: 'குடும்ப வருமானம் (ஆண்டுக்கு ₹)',
        familyIncomeDesc: 'எ.கா. 120000',
        gender: 'பாலினம்',
        male: 'ஆண்',
        female: 'பெண்',
        other: 'மற்றவை',
        finalStep: 'இறுதிப் படி',
        prefLang: 'விருப்பமான கணினி மொழி',
        createPwd: 'கடவுச்சொல்லை உருவாக்கவும்',
        createPwdDesc: 'Google மூலம் உள்நுழைந்ததால், மின்னஞ்சல் மூலம் உள்நுழைய கடவுச்சொல்லை அமைக்கலாம்.',
        pwdPlaceholder: 'கடவுச்சொல்லை உள்ளிடவும் (விருப்பப்படி)',
        saving: 'சேமிக்கிறது...',
        completeOnboarding: 'பதிவை நிறைவு செய்',
        religion: 'மதம்',
        marks: 'கல்வி மதிப்பெண்கள் (%)',
        marksDesc: 'எ.கா. 85',
        companyType: 'விருப்பமான நிறுவன வகை',
        minStipend: 'குறைந்தபட்ச உதவித்தொகை (₹)',
        duration: 'விருப்பமான காலம் (மாதங்கள்)',
        mnc: 'பன்னாட்டு நிறுவனம் (MNC)',
        startup: 'ஸ்டார்ட்அப்',
        newVenture: 'புதிய முயற்சி (New Venture)',
        prefLocation: 'விருப்பமான இன்டர்ன்ஷிப் இடம்',
        prefLocationDesc: 'எ.கா. சென்னை, Remote, பெங்களூர்',
        any: 'ஏதேனும்'
    },
    Hindi: {
        welcomeTitle: 'InternHub में आपका स्वागत है!',
        welcomeDesc: "आइए आपके अनुभव को वैयक्तिकृत करें।",
        logout: 'लॉग आउट',
        lookingFor: 'आप क्या खोज रहे हैं?',
        internships: 'इंटर्नशिप',
        scholarships: 'छात्रवृत्ति',
        both: 'दोनों',
        nextBtn: 'अगला',
        backBtn: 'पीछे',
        internshipPref: 'इंटर्नशिप प्राथमिकताएं',
        collegeCompany: 'कॉलेज या कंपनी का नाम',
        collegeCompanyDesc: 'आप कहाँ पढ़ते या काम करते हैं?',
        degree: 'डिग्री',
        degreeDesc: 'उदा. बी.टेक कंप्यूटर साइंस',
        skills: 'आपके कौशल (अल्पविराम से अलग करके)',
        skillsDesc: 'उदा. React, Python, Java',
        resume: 'रिज्यूमे लिंक (Google Drive) [वैकल्पिक]',
        resumeDesc: 'https://drive.google.com/...',
        scholarshipDetails: 'छात्रवृत्ति विवरण',
        geoLoc: 'भौगोलिक स्थान',
        detectLoc: 'मेरा स्थान पहचानें',
        detecting: 'पता लगाया जा रहा है...',
        city: 'शहर / जिला',
        state: 'राज्य',
        eduLevel: 'शिक्षा स्तर',
        community: 'समुदाय',
        familyIncome: 'पारिवारिक आय (वार्षिक ₹)',
        familyIncomeDesc: 'उदा. 120000',
        gender: 'लिंग',
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        finalStep: 'अंतिम चरण',
        prefLang: 'पसंदीदा सिस्टम भाषा',
        createPwd: 'पासवर्ड बनाएँ',
        createPwdDesc: 'चूंकि आपने Google से साइन इन किया है, इसलिए आप भविष्य में ईमेल से साइन इन करने के लिए पासवर्ड सेट कर सकते हैं।',
        pwdPlaceholder: 'पासवर्ड दर्ज करें (वैकल्पिक)',
        saving: 'सहेजा जा रहा है...',
        completeOnboarding: 'ऑनबोर्डिंग पूरी करें',
        religion: 'धर्म',
        marks: 'अकादमिक अंक (%)',
        marksDesc: 'उदा. 85',
        companyType: 'पसंदीदा कंपनी का प्रकार',
        minStipend: 'न्यूनतम वजीफा (₹)',
        duration: 'पसंदीदा अवधि (महीने)',
        mnc: 'एमएनसी (MNC)',
        startup: 'स्टार्टअप',
        newVenture: 'नया उद्यम (New Venture)',
        prefLocation: 'पसंदीदा इंटर्नशिप स्थान',
        prefLocationDesc: 'उदा. चेन्नई, रिमोट, बैंगलोर',
        any: 'कोई भी'
    },
};

export default function Onboarding() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const { language: contextLang, setLanguage: setContextLang } = useLanguage();
    const t = translations[contextLang] || translations['English'];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        logout();
        navigate('/login');
    };

    const [objective, setObjective] = useState<'internship' | 'scholarship' | 'both'>('both');
    const [step, setStep] = useState(2);

    // Common fields
    const [language, setLanguage] = useState(user?.preferred_language || 'English');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Scholarship fields
    const [locationStr, setLocationStr] = useState(user?.location || '');
    const [stateLocation, setStateLocation] = useState(user?.state || '');
    const [community, setCommunity] = useState(user?.community || 'General');
    const [educationLevel, setEducationLevel] = useState(user?.education_level || 'UG');
    const [gender, setGender] = useState(user?.gender || 'Male');
    const [incomeStr, setIncomeStr] = useState(user?.income?.toString() || '');
    const [religion, setReligion] = useState(user?.religion || '');
    const [marksStr, setMarksStr] = useState(user?.academic_marks?.toString() || '');

    // Internship fields
    const [collegeOrCompany, setCollegeOrCompany] = useState(user?.college_or_company || '');
    const [resumeLink, setResumeLink] = useState(user?.resume_link || '');
    const [degree, setDegree] = useState(user?.degree || '');
    const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(', '));
    const [companyTypes, setCompanyTypes] = useState<string[]>(user?.preferred_company_types || []);
    const [locationPreference, setLocationPreference] = useState(user?.location_preference || '');
    const [minStipendStr, setMinStipendStr] = useState(user?.min_stipend?.toString() || '');
    const [durationStr, setDurationStr] = useState(user?.preferred_duration?.toString() || '');

    const [loading, setLoading] = useState(false);

    const validateLocation = async (city: string, state: string) => {
        if (!city || !state) return false;
        try {
            const query = encodeURIComponent(`${city}, ${state}, India`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();
            return data && data.length > 0;
        } catch (err) {
            console.error("Location validation failed", err);
            return true; // Fallback to true if API fails to avoid blocking user
        }
    };

    const detectLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    if (data.address) {
                        const detectedCity = data.address.city || data.address.town || data.address.village || data.address.county || '';
                        const detectedState = data.address.state || '';
                        setLocationStr(detectedCity);
                        setStateLocation(detectedState);
                        // Show success feedback
                        const btn = document.getElementById('detect-loc-btn');
                        if (btn) {
                            const originalText = btn.innerText;
                            btn.innerText = "✓ " + (language === 'Tamil' ? 'கண்டறியப்பட்டது' : language === 'Hindi' ? 'पता चल गया' : 'Detected');
                            btn.classList.add('bg-green-100', 'text-green-600', 'border-green-200');
                            setTimeout(() => {
                                if (btn) {
                                    btn.innerText = originalText;
                                    btn.classList.remove('bg-green-100', 'text-green-600', 'border-green-200');
                                }
                            }, 3000);
                        }
                    }
                } catch (err) {
                    console.error("Geocoding failed", err);
                } finally {
                    setLoading(false);
                }
            }, () => {
                alert("Location access denied or failed.");
                setLoading(false);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for Scholarship Details
        if (objective === 'scholarship' || objective === 'both') {
            if (!locationStr || !stateLocation) {
                alert("Please provide or detect your location details for scholarships.");
                return;
            }

            setLoading(true);
            const isValid = await validateLocation(locationStr, stateLocation);
            if (!isValid) {
                alert(language === 'Tamil' ? "தவறான இடம். தயவுசெய்து சரியான ஊர் பெயரை உள்ளிடவும்." :
                    language === 'Hindi' ? "अमान्य स्थान। कृपया एक मान्य शहर का नाम दर्ज करें।" :
                        "Invalid location. Please enter a valid city and state.");
                setLoading(false);
                return;
            }
        }

        setLoading(true);

        const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const income = incomeStr ? parseInt(incomeStr, 10) : null;

        try {
            const bodyPayload: any = {
                preferred_language: language,
                location: locationStr,
                state: stateLocation,
                skills,
                community,
                education_level: educationLevel,
                gender,
                income,
                college_or_company: collegeOrCompany,
                resume_link: resumeLink,
                degree,
                religion,
                academic_marks: marksStr ? parseFloat(marksStr) : undefined,
                location_preference: locationPreference,
                preferred_company_types: companyTypes,
                min_stipend: minStipendStr ? parseInt(minStipendStr, 10) : undefined,
                preferred_duration: durationStr ? parseInt(durationStr, 10) : undefined,
            };

            if (!user?.hasPassword && password) {
                bodyPayload.password = password;
            }

            const res = await fetch('/api/profile/onboarding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();

            if (res.ok) {
                updateUser({
                    preferred_language: language,
                    location: locationStr,
                    state: stateLocation,
                    skills,
                    community,
                    education_level: educationLevel,
                    gender,
                    income: income ?? undefined,
                    college_or_company: collegeOrCompany,
                    resume_link: resumeLink,
                    degree,
                    religion,
                    academic_marks: marksStr ? parseFloat(marksStr) : undefined,
                    location_preference: locationPreference,
                    preferred_company_types: companyTypes,
                    min_stipend: minStipendStr ? parseInt(minStipendStr, 10) : undefined,
                    preferred_duration: durationStr ? parseInt(durationStr, 10) : undefined,
                    hasPassword: user?.hasPassword || !!password,
                    onboarding_completed: true
                });
                setContextLang(language);
                navigate(data.redirect || '/dashboard');
            } else {
                alert(data.error || "Failed to save profile");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
                <button
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-muted hover:text-indigo-600 transition-colors bg-card px-4 py-2 rounded-lg shadow-sm border border-border hover:border-indigo-300"
                >
                    {t.logout} - {user?.full_name || user?.email || 'User'}
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <h2 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">{t.welcomeTitle}</h2>
                <p className="text-center text-muted mb-8 font-medium">{t.welcomeDesc}</p>

                <div className="bg-card py-8 px-6 shadow-xl shadow-indigo-100/50 border border-indigo-50 sm:rounded-2xl">

                    {/* Progress Bar */}
                    <div className="mb-8 flex justify-center items-center space-x-2">
                        <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 w-16 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* STEP 1: Objective */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h3 className="text-xl font-bold text-text mb-4 text-center">{t.lookingFor}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button type="button" onClick={() => setObjective('internship')} className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${objective === 'internship' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-border hover:border-indigo-300'}`}>
                                        <Briefcase className={`w-8 h-8 mb-2 ${objective === 'internship' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${objective === 'internship' ? 'text-indigo-900' : 'text-muted'}`}>{t.internships}</span>
                                    </button>
                                    <button type="button" onClick={() => setObjective('scholarship')} className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${objective === 'scholarship' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-border hover:border-indigo-300'}`}>
                                        <GraduationCap className={`w-8 h-8 mb-2 ${objective === 'scholarship' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${objective === 'scholarship' ? 'text-indigo-900' : 'text-muted'}`}>{t.scholarships}</span>
                                    </button>
                                    <button type="button" onClick={() => setObjective('both')} className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all ${objective === 'both' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-border hover:border-indigo-300'}`}>
                                        <Layers className={`w-8 h-8 mb-2 ${objective === 'both' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${objective === 'both' ? 'text-indigo-900' : 'text-muted'}`}>{t.both}</span>
                                    </button>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button type="button" onClick={handleNext} className="bg-indigo-600 text-white font-bold rounded-xl py-2.5 px-6 hover:bg-indigo-700 transition-all">{t.nextBtn}</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Internship or Scholarship Details */}
                        {step === 2 && (
                            <div className="animate-fade-in space-y-6">
                                {objective === 'internship' || objective === 'both' ? (
                                    <>
                                        <h3 className="text-xl font-bold text-text mb-4 border-b pb-2">{t.internshipPref}</h3>
                                        <div>
                                            <label className="block text-sm font-semibold text-text">{t.collegeCompany}</label>
                                            <input type="text" value={collegeOrCompany} onChange={e => setCollegeOrCompany(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.collegeCompanyDesc} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text">{t.degree}</label>
                                            <input type="text" value={degree} onChange={e => setDegree(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.degreeDesc} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text">{t.skills}</label>
                                            <input type="text" value={skillsStr} onChange={e => setSkillsStr(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.skillsDesc} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text">{t.prefLocation}</label>
                                            <input type="text" value={locationPreference} onChange={e => setLocationPreference(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.prefLocationDesc} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text">{t.resume}</label>
                                            <input type="url" value={resumeLink} onChange={e => setResumeLink(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.resumeDesc} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.minStipend}</label>
                                                <input type="number" value={minStipendStr} onChange={e => setMinStipendStr(e.target.value)} className="input-field mt-1" placeholder="e.g. 5000" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.duration}</label>
                                                <input type="number" value={durationStr} onChange={e => setDurationStr(e.target.value)} className="input-field mt-1" placeholder="e.g. 3" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-text mb-2">{t.companyType}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['Any', 'MNC', 'Startup', 'New Venture'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setCompanyTypes(prev => {
                                                                if (type === 'Any') {
                                                                    return prev.includes('Any') ? [] : ['Any'];
                                                                } else {
                                                                    const filtered = prev.filter(t => t !== 'Any');
                                                                    return filtered.includes(type) ? filtered.filter(t => t !== type) : [...filtered, type];
                                                                }
                                                            })
                                                        }}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${companyTypes.includes(type) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-muted border-border hover:border-indigo-300'}`}
                                                    >
                                                        {t[type.toLowerCase().replace(' ', '')] || type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // If Scholarship ONLY
                                    <>
                                        <h3 className="text-xl font-bold text-text mb-4 border-b dark:border-gray-700 pb-2">{t.scholarshipDetails}</h3>
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-gray-700 mb-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-bold text-indigo-900 flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1 text-indigo-600" /> {t.geoLoc}
                                                </h3>
                                                <button type="button" id="detect-loc-btn" onClick={detectLocation} disabled={loading} className="text-xs bg-card text-indigo-600 font-bold px-3 py-2 rounded-lg hover:bg-indigo-50 border border-indigo-200 shadow-sm transition-all focus:ring-2 ring-indigo-500 outline-none">
                                                    {loading ? t.detecting : t.detectLoc}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-indigo-700/70">{t.city}</label>
                                                    <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)} className="input-field mt-1 bg-card border-indigo-100 text-indigo-900 outline-none focus:ring-0 shadow-inner" required={objective === 'scholarship'} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-indigo-700/70">{t.state}</label>
                                                    <input type="text" value={stateLocation} onChange={e => setStateLocation(e.target.value)} className="input-field mt-1 bg-card border-indigo-100 text-indigo-900 outline-none focus:ring-0 shadow-inner" required={objective === 'scholarship'} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.eduLevel}</label>
                                                <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="High School">High School</option>
                                                    <option value="UG">Undergraduate (UG)</option>
                                                    <option value="PG">Postgraduate (PG)</option>
                                                    <option value="PhD">PhD</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.community}</label>
                                                <select value={community} onChange={e => setCommunity(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="General">General</option>
                                                    <option value="OBC">OBC</option>
                                                    <option value="SC">SC</option>
                                                    <option value="ST">ST</option>
                                                    <option value="Minority">Minority</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.gender}</label>
                                                <select value={gender} onChange={e => setGender(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="Male">{t.male}</option>
                                                    <option value="Female">{t.female}</option>
                                                    <option value="Other">{t.other}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.familyIncome}</label>
                                                <input type="number" value={incomeStr} onChange={e => setIncomeStr(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.familyIncomeDesc} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={handleBack} className="text-muted font-bold py-2.5 px-6 hover:bg-gray-100 rounded-xl transition-all">{t.backBtn}</button>
                                    <button type="button" onClick={handleNext} className="bg-indigo-600 text-white font-bold rounded-xl py-2.5 px-6 hover:bg-indigo-700 transition-all">{t.nextBtn}</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Remaining Details & Password */}
                        {step === 3 && (
                            <div className="animate-fade-in space-y-6">
                                {objective === 'both' ? (
                                    <>
                                        <h3 className="text-xl font-bold text-text mb-4 border-b dark:border-gray-700 pb-2">{t.scholarshipDetails}</h3>
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-xl border border-indigo-100 dark:border-gray-700 mb-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-bold text-indigo-900 flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1 text-indigo-600" /> {t.geoLoc}
                                                </h3>
                                                <button type="button" id="detect-loc-btn" onClick={detectLocation} disabled={loading} className="text-xs bg-card text-indigo-600 font-bold px-3 py-2 rounded-lg hover:bg-indigo-50 border border-indigo-200 shadow-sm transition-all focus:ring-2 ring-indigo-500 outline-none">
                                                    {loading ? t.detecting : t.detectLoc}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-indigo-700/70">{t.city}</label>
                                                    <input type="text" value={locationStr} onChange={e => setLocationStr(e.target.value)} className="input-field mt-1 bg-card border-indigo-100 text-indigo-900 outline-none focus:ring-0 shadow-inner" required />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-indigo-700/70">{t.state}</label>
                                                    <input type="text" value={stateLocation} onChange={e => setStateLocation(e.target.value)} className="input-field mt-1 bg-card border-indigo-100 text-indigo-900 outline-none focus:ring-0 shadow-inner" required />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.eduLevel}</label>
                                                <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="High School">High School</option>
                                                    <option value="UG">Undergraduate (UG)</option>
                                                    <option value="PG">Postgraduate (PG)</option>
                                                    <option value="PhD">PhD</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.community}</label>
                                                <select value={community} onChange={e => setCommunity(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="General">General</option>
                                                    <option value="OBC">OBC</option>
                                                    <option value="SC">SC</option>
                                                    <option value="ST">ST</option>
                                                    <option value="Minority">Minority</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.gender}</label>
                                                <select value={gender} onChange={e => setGender(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                                    <option value="Male">{t.male}</option>
                                                    <option value="Female">{t.female}</option>
                                                    <option value="Other">{t.other}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.familyIncome}</label>
                                                <input type="number" value={incomeStr} onChange={e => setIncomeStr(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.familyIncomeDesc} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.religion}</label>
                                                <select value={religion} onChange={e => setReligion(e.target.value)} className="input-field mt-1 dark:bg-slate-800 dark:text-white">
                                                    <option value="" className="dark:bg-slate-800">Select</option>
                                                    <option value="Hindu" className="dark:bg-slate-800">Hindu</option>
                                                    <option value="Muslim" className="dark:bg-slate-800">Muslim</option>
                                                    <option value="Christian" className="dark:bg-slate-800">Christian</option>
                                                    <option value="Sikh" className="dark:bg-slate-800">Sikh</option>
                                                    <option value="Buddhist" className="dark:bg-slate-800">Buddhist</option>
                                                    <option value="Jain" className="dark:bg-slate-800">Jain</option>
                                                    <option value="Other" className="dark:bg-slate-800">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-text">{t.marks}</label>
                                                <input type="number" value={marksStr} onChange={e => setMarksStr(e.target.value)} className="input-field mt-1" placeholder={t.marksDesc} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <h3 className="text-xl font-bold text-text mb-4 border-b pb-2">{t.finalStep}</h3>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-text">{t.prefLang}</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field mt-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white">
                                        <option value="English" className="dark:bg-slate-800">English</option>
                                        <option value="Tamil" className="dark:bg-slate-800">தமிழ்</option>
                                        <option value="Hindi" className="dark:bg-slate-800">Hindi</option>
                                    </select>
                                </div>

                                {!user?.hasPassword && (
                                    <div className="bg-yellow-50 dark:bg-slate-800 p-4 rounded-xl border border-yellow-200 dark:border-slate-700 mt-4">
                                        <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2">{t.createPwd}</h4>
                                        <p className="text-xs text-yellow-700 dark:text-slate-400 mb-3">{t.createPwdDesc}</p>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-field focus:ring-yellow-500 focus:border-yellow-500 pr-10"
                                                placeholder={t.pwdPlaceholder}
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-primary transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={handleBack} className="text-muted font-bold py-2.5 px-6 hover:bg-gray-100 rounded-xl transition-all">{t.backBtn}</button>
                                    <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl py-2.5 px-8 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide">
                                        {loading ? t.saving : t.completeOnboarding}
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}
