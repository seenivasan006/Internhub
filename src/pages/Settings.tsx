import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        profileSettings: 'Profile Settings',
        amountRange: 'Amount Range',
        loading: 'Loading...',
        personalInfo: 'Academic & Personal',
        eduLevel: 'Education Level',
        college: 'College/University Name',
        income: 'Annual Family Income',
        dob: 'Date of Birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        skills: "Skills (comma separated)",
        prefLocation: "Preferred Location",
        companyType: "Preferred Company Type",
        duration: "Preferred Duration",
        fieldOfStudy: "Field of Study",
        eligibility: "Eligibility Criteria",
        location: "Current Location",
        refreshLocation: "Update Location",
        viewResume: "View Resume",
        deleteResume: "Delete Resume",
        internshipHeader: "Tell us about the kind of internships you're looking for.",
        scholarshipHeader: "Provide your academic details to find matching scholarships.",
        documentsHeader: "Upload your professional resume. Please use PDF format and name it clearly (e.g., YourName_Resume.pdf).",
        internshipPrefs: "Internship Preferences",
        scholarshipPrefs: "Scholarship Preferences",
        documents: "Documents",
        saveBtn: "Save Settings",
        any: "Any"
    },
    Tamil: {
        profileSettings: 'சுயவிவர அமைப்புகள்',
        personalInfo: 'தனிப்பட்ட தகவல்',
        internshipPrefs: 'இன்டர்ன்ஷிப் விருப்பத்தேர்வுகள்',
        scholarshipPrefs: 'உதவித்தொகை விருப்பத்தேர்வுகள்',
        documents: 'ஆவணங்கள்',
        resume: 'சுயவிவரக் குறிப்பு (PDF)',
        uploadResume: 'பதிவேற்றவும்',
        saveBtn: 'சேமிக்கவும்',
        saving: 'சேமிக்கிறது...',
        success: 'வெற்றிகரமாகச் சேமிக்கப்பட்டது!',
        any: 'ஏதேனும்'
    }
}

export default function Settings() {
    const { user, updateUser } = useAuth();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [activeTab, setActiveTab] = useState<'personal' | 'internship' | 'scholarship' | 'documents'>('personal');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [intPrefs, setIntPrefs] = useState({
        skills: user?.skills || [],
        locationPreference: user?.location_preference || '',
        preferredCompanyTypes: user?.preferred_company_types || [],
        minStipend: user?.min_stipend || '',
        preferredDuration: user?.preferred_duration || ''
    });

    const [scholPrefs, setScholPrefs] = useState({
        community: user?.community || '',
        educationLevel: user?.education_level || '',
        income: user?.income || '',
        religion: user?.religion || '',
        academicMarks: user?.academic_marks || ''
    });

    const [personalInfo, setPersonalInfo] = useState({
        educationLevel: user?.education_level || '',
        collegeName: user?.college_or_company || '',
        annualIncome: user?.income || '',
        gender: user?.gender || '',
        religion: user?.religion || '',
        academicMarks: user?.academic_marks || '',
        degree: user?.degree || ''
    });


    const handleRefreshLocation = async () => {
        setLoading(true);
        try {
            const { requestLocation } = await import('../services/locationService');
            const loc = await requestLocation();
            if (loc.city) {
                const res = await fetch('/api/profile/location', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: loc.city, state: loc.state })
                });
                if (res.ok) {
                    const data = await res.json();
                    updateUser(data.user);
                    setMessage('Location updated successfully!');
                }
            }
        } catch (err: any) {
            setMessage(err.message || 'Failed to get location');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setLoading(true);
        setMessage('');
        try {
            const payload = activeTab === 'internship' ? {
                skills: intPrefs.skills,
                location_preference: intPrefs.locationPreference,
                preferred_company_types: intPrefs.preferredCompanyTypes,
                min_stipend: intPrefs.minStipend,
                preferred_duration: intPrefs.preferredDuration
            } : {
                community: scholPrefs.community,
                education_level: scholPrefs.educationLevel,
                income: scholPrefs.income,
                religion: scholPrefs.religion,
                academic_marks: scholPrefs.academicMarks
            };

            const res = await fetch('/api/profile/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                updateUser(data.user);
                setMessage(t.success || 'Settings updated successfully!');
            }
        } catch (err) {
            setMessage('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePersonal = async () => {
        setLoading(true);
        setMessage('');
        try {
            const payload = {
                education_level: personalInfo.educationLevel,
                college_or_company: personalInfo.collegeName,
                income: personalInfo.annualIncome,
                gender: personalInfo.gender,
                religion: personalInfo.religion,
                academic_marks: personalInfo.academicMarks,
                degree: personalInfo.degree
            };

            const res = await fetch('/api/profile/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                updateUser(data.user);
                setMessage(t.success || 'Settings updated successfully!');
            }
        } catch (err) {
            setMessage('Failed to update personal info');
        } finally {
            setLoading(false);
        }
    };


    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await fetch('/api/upload/resume', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                updateUser({ resumeUrl: data.resumeUrl });
                setMessage('Resume uploaded successfully!');
            } else {
                const err = await res.json();
                setMessage(err.error || 'Upload failed');
            }
        } catch (err) {
            setMessage('Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async () => {
        if (!confirm('Are you sure you want to delete your resume?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/upload/resume', { method: 'DELETE' });
            if (res.ok) {
                updateUser({ resumeUrl: '' });
                setMessage('Resume deleted');
            }
        } catch (err) {
            setMessage('Failed to delete resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-text">{t.profileSettings}</h1>

            {message && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.includes('success') || message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <CheckCircle className="w-5 h-5" />
                    <span>{message}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl scrollbar-hide overflow-x-auto">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'personal' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                >
                    {t.personalInfo}
                </button>
                <button
                    onClick={() => setActiveTab('internship')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'internship' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                >
                    {t.internshipPrefs}
                </button>
                <button
                    onClick={() => setActiveTab('scholarship')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'scholarship' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                >
                    {t.scholarshipPrefs}
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'documents' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                >
                    {t.documents}
                </button>
            </div>

            <div className="card">
                {activeTab === 'personal' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text">{t.eduLevel}</label>
                                <select
                                    value={personalInfo.educationLevel}
                                    onChange={e => setPersonalInfo({ ...personalInfo, educationLevel: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="">Select Level</option>
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="UG">Undergraduate (UG)</option>
                                    <option value="PG">Postgraduate (PG)</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Degree</label>
                                <input
                                    type="text"
                                    value={personalInfo.degree}
                                    onChange={e => setPersonalInfo({ ...personalInfo, degree: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. B.Tech Computer Science"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">{t.college}</label>
                                <input
                                    type="text"
                                    value={personalInfo.collegeName}
                                    onChange={e => setPersonalInfo({ ...personalInfo, collegeName: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. IIT Madras"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">{t.gender}</label>
                                <select
                                    value={personalInfo.gender}
                                    onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">{t.male}</option>
                                    <option value="Female">{t.female}</option>
                                    <option value="Other">{t.other}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Religion</label>
                                <select
                                    value={personalInfo.religion || ''}
                                    onChange={e => setPersonalInfo({ ...personalInfo, religion: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="">Select Religion</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Sikh">Sikh</option>
                                    <option value="Buddhist">Buddhist</option>
                                    <option value="Jain">Jain</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Academic Marks (%)</label>
                                <input
                                    type="number"
                                    value={personalInfo.academicMarks}
                                    onChange={e => setPersonalInfo({ ...personalInfo, academicMarks: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. 85"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">{t.income}</label>
                                <input
                                    type="number"
                                    value={personalInfo.annualIncome}
                                    onChange={e => setPersonalInfo({ ...personalInfo, annualIncome: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. 500000"
                                />
                            </div>
                        </div>
                        <button onClick={handleSavePersonal} disabled={loading} className="btn-primary w-full md:w-auto">
                            {loading ? t.saving : t.saveBtn}
                        </button>
                    </div>
                )}
                {activeTab === 'internship' && (
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4 mb-4">
                            <p className="text-sm text-muted">{t.internshipHeader}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text">{t.skills}</label>
                                <input
                                    type="text"
                                    value={intPrefs.skills.join(', ')}
                                    onChange={e => setIntPrefs({ ...intPrefs, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    className="input-field mt-1"
                                    placeholder="e.g. React, Node.js"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Preferred Location</label>
                                <input
                                    type="text"
                                    value={intPrefs.locationPreference}
                                    onChange={e => setIntPrefs({ ...intPrefs, locationPreference: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. Chennai, Remote"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Min. Stipend (₹)</label>
                                <input
                                    type="number"
                                    value={intPrefs.minStipend}
                                    onChange={e => setIntPrefs({ ...intPrefs, minStipend: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Duration (Months)</label>
                                <input
                                    type="number"
                                    value={intPrefs.preferredDuration}
                                    onChange={e => setIntPrefs({ ...intPrefs, preferredDuration: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. 3"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text mb-2">Company Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Any', 'MNC', 'Startup', 'New Venture'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                const current = intPrefs.preferredCompanyTypes || [];
                                                let next;
                                                if (type === 'Any') {
                                                    next = current.includes('Any') ? [] : ['Any'];
                                                } else {
                                                    const filtered = current.filter(t => t !== 'Any');
                                                    next = filtered.includes(type) ? filtered.filter(t => t !== type) : [...filtered, type];
                                                }
                                                setIntPrefs({ ...intPrefs, preferredCompanyTypes: next });
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${(intPrefs.preferredCompanyTypes || []).includes(type) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-muted border-border hover:border-indigo-300'}`}
                                        >
                                            {t[type.toLowerCase()] || type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSavePreferences} disabled={loading} className="btn-primary w-full md:w-auto">
                            {loading ? t.saving : t.saveBtn}
                        </button>
                    </div>
                )}

                {activeTab === 'scholarship' && (
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4 mb-4">
                            <p className="text-sm text-muted">{t.scholarshipHeader}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text">Community</label>
                                <select
                                    value={scholPrefs.community}
                                    onChange={e => setScholPrefs({ ...scholPrefs, community: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="General">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="Minority">Minority</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Education Level</label>
                                <select
                                    value={scholPrefs.educationLevel}
                                    onChange={e => setScholPrefs({ ...scholPrefs, educationLevel: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="High School">High School</option>
                                    <option value="UG">Undergraduate (UG)</option>
                                    <option value="PG">Postgraduate (PG)</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Academic Marks (%)</label>
                                <input
                                    type="number"
                                    value={scholPrefs.academicMarks}
                                    onChange={e => setScholPrefs({ ...scholPrefs, academicMarks: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="e.g. 85"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">Religion</label>
                                <select
                                    value={scholPrefs.religion}
                                    onChange={e => setScholPrefs({ ...scholPrefs, religion: e.target.value })}
                                    className="input-field mt-1"
                                >
                                    <option value="">Select Religion</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Sikh">Sikh</option>
                                    <option value="Buddhist">Buddhist</option>
                                    <option value="Jain">Jain</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text">{t.location}</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input
                                        type="text"
                                        value={`${user?.location || ''}${user?.state ? ', ' + user.state : ''}` || 'Not set'}
                                        disabled
                                        className="input-field bg-gray-50 dark:bg-gray-800"
                                    />
                                    <button
                                        onClick={handleRefreshLocation}
                                        className="px-3 py-2 bg-secondary text-primary rounded-lg text-sm font-bold hover:bg-secondary/80"
                                    >
                                        {t.refreshLocation}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSavePreferences} disabled={loading} className="btn-primary w-full md:w-auto">
                            {loading ? t.saving : t.saveBtn}
                        </button>
                    </div>
                )}


                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        <div className="border-b border-border pb-4 mb-4">
                            <p className="text-sm text-muted">{t.documentsHeader}</p>
                        </div>
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                            {user?.resumeUrl ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center space-x-3 text-primary">
                                        <FileText className="w-12 h-12" />
                                        <div className="text-left">
                                            <p className="font-bold text-text">Resume Attached</p>
                                            <a
                                                href={user.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm hover:underline"
                                            >
                                                {t.viewResume}
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeleteResume}
                                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center justify-center w-full space-x-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{t.deleteResume}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload className="w-12 h-12 text-muted mx-auto" />
                                    <div>
                                        <p className="font-bold text-text">{t.uploadResume}</p>
                                        <p className="text-sm text-muted">PDF files only, max 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        className="hidden"
                                        id="resume-upload"
                                    />
                                    <label
                                        htmlFor="resume-upload"
                                        className="btn-primary inline-block cursor-pointer"
                                    >
                                        Select File
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
