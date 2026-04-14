// INTERNHUB_UPDATE: One-Click Apply page with auto-filled form
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Send, Save, ArrowLeft, CheckCircle, FileText, Loader2, Sparkles, Wand2 } from 'lucide-react';

const translations: Record<string, any> = {
    English: {
        applyTo: 'Apply to',
        autoFilled: 'Auto-filled from your profile',
        editBelow: 'Review and edit the details below before submitting.',
        fullName: 'Full Name',
        email: 'Email',
        location: 'Location',
        education: 'Education Level',
        fieldOfStudy: 'Field of Study',
        skills: 'Skills',
        college: 'College / Company',
        coverLetter: 'Cover Letter',
        whyApply: 'Why do you want this scholarship?',
        resume: 'Resume',
        resumeAttached: 'Resume attached from profile',
        noResume: 'No resume on file. Upload one in Settings.',
        saveDraft: 'Save Draft',
        submitApp: 'Submit Application',
        submitting: 'Submitting...',
        success: 'Application submitted successfully!',
        draftSaved: 'Draft saved!',
        back: 'Back',
        loading: 'Preparing your application...',
        alreadySubmitted: 'You have already submitted this application.',
        errorLoad: 'Failed to load application data.',
        generateAI: 'Generate with AI',
        generating: 'AI is writing...',
        aiOutline: 'AI Essay Outline',
        autofillTitle: 'Autofill Application?',
        autofillDesc: 'Would you like to automatically fill this application using details from your profile?',
        autofillYes: 'Yes, Autofill',
        autofillNo: 'No, Start Blank',
        manualAutofill: '⚡ Autofill from Profile',
        externalNotice: 'Note: For external opportunities (LinkedIn, Internshala, etc.), you must also complete any required steps on the original platform.'
    },
    // ... other languages updated later if needed
};

export default function ApplyPage() {
    const { opportunityId } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'internship';
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiOutline, setAiOutline] = useState('');
    const [message, setMessage] = useState('');
    const [application, setApplication] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [opportunityTitle, setOpportunityTitle] = useState('');
    const [showAutofillModal, setShowAutofillModal] = useState(false);
    const [fullAnswers, setFullAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        loadDraft();
    }, [opportunityId]);

    const loadDraft = async () => {
        try {
            const res = await fetch('/api/applications/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId, type })
            });
            const data = await res.json();
            if (data.application) {
                setApplication(data.application);
                setOpportunityTitle(data.application.opportunityTitle);
                // Convert Map-like object to regular object
                const ans = data.application.answers || {};
                const parsed: Record<string, string> = {};
                if (ans instanceof Object) {
                    for (const [k, v] of Object.entries(ans)) {
                        parsed[k] = v as string;
                    }
                }
                setAnswers(parsed);
                setFullAnswers(parsed);
                if (!data.isExisting) {
                    setShowAutofillModal(true);
                }
            }
        } catch (err: any) {
            console.error('Load draft error:', err);
            setMessage(err.message || t.errorLoad);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleAutofillConfirm = (confirm: boolean) => {
        if (!confirm) {
            // Keep only essential fields if user declines autofill
            const blankAnswers: Record<string, string> = {
                fullName: '',
                email: '',
                location: '',
                education: '',
                fieldOfStudy: '',
                skills: '',
                college: '',
                coverLetter: '',
                whyApply: ''
            };
            setAnswers(blankAnswers);
        }
        setShowAutofillModal(false);
    };

    const triggerManualAutofill = () => {
        setAnswers(fullAnswers);
        setMessage('Details autofilled from profile.');
        setTimeout(() => setMessage(''), 3000);
    };

    // INTERNHUB_AI_ASSISTANT: Call backend to generate AI content
    const handleGenerateAI = async () => {
        setGeneratingAI(true);
        setMessage('');
        try {
            if (type === 'internship') {
                const res = await fetch('/api/ai/cover-letter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ opportunityId })
                });
                const data = await res.json();
                if (data.coverLetter) {
                    updateField('coverLetter', data.coverLetter);
                } else {
                    throw new Error(data.error || 'Failed to generate');
                }
            } else {
                // For scholarships, generate an outline
                const res = await fetch('/api/ai/essay-outline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        opportunityId,
                        essayPrompt: answers.whyApply || 'How will this scholarship help you achieve your goals?'
                    })
                });
                const data = await res.json();
                if (data.outline) {
                    setAiOutline(data.outline);
                } else {
                    throw new Error(data.error || 'Failed to generate');
                }
            }
        } catch (err: any) {
            setMessage(`AI Error: ${err.message}`);
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const res = await fetch(`/api/applications/${application._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            if (res.ok) setMessage(t.draftSaved);
        } catch (err) {
            setMessage('Failed to save draft');
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/applications/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application._id, answers })
            });
            if (res.ok) {
                setMessage(t.success);
                setTimeout(() => navigate('/applications'), 2000);
            } else {
                const errorData = await res.json();
                setMessage(errorData.error || 'Submission failed');
            }
        } catch (err) {
            setMessage('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted">{t.loading}</p>
                </div>
            </div>
        );
    }

    const isSubmitted = application?.status !== 'draft';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-muted hover:text-text transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
            </button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-text">{t.applyTo}: {opportunityTitle}</h1>
                <div className="flex items-center space-x-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">{t.autoFilled}</span>
                </div>
                <p className="text-muted">{t.editBelow}</p>
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{t.externalNotice}</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center space-x-2 ${message.includes('success') || message.includes('saved') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{message}</span>
                </div>
            )}

            {isSubmitted ? (
                <div className="card text-center py-12 space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-xl font-bold text-text">{t.alreadySubmitted}</h2>
                    <p className="text-muted">Status: <span className="font-bold capitalize">{application.status}</span></p>
                    <button onClick={() => navigate('/applications')} className="btn-primary">
                        View My Applications
                    </button>
                </div>
            ) : (
                <div className="card space-y-6">
                    <div className="flex justify-end">
                        <button 
                            onClick={triggerManualAutofill}
                            className="text-xs font-bold text-primary hover:text-accent flex items-center gap-1 transition-colors"
                        >
                            {t.manualAutofill}
                        </button>
                    </div>
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.fullName}</label>
                            <input type="text" value={answers.fullName || ''} onChange={e => updateField('fullName', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.email}</label>
                            <input type="email" value={answers.email || ''} onChange={e => updateField('email', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.location || 'Location'}</label>
                            <input type="text" value={answers.location || ''} onChange={e => updateField('location', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.education || 'Education'}</label>
                            <input type="text" value={answers.education || ''} onChange={e => updateField('education', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.fieldOfStudy || 'Field of Study'}</label>
                            <input type="text" value={answers.fieldOfStudy || ''} onChange={e => updateField('fieldOfStudy', e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">{t.skills || 'Skills'}</label>
                            <input type="text" value={answers.skills || ''} onChange={e => updateField('skills', e.target.value)} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text mb-1">{t.college || 'College'}</label>
                            <input type="text" value={answers.college || ''} onChange={e => updateField('college', e.target.value)} className="input-field" />
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Resume */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">{t.resume || 'Resume'}</label>
                        {answers.resumeUrl ? (
                            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700 dark:text-green-400 font-medium">{t.resumeAttached}</span>
                                <a href={answers.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline ml-auto">View</a>
                            </div>
                        ) : (
                            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">{t.noResume}</p>
                        )}
                    </div>

                    {/* Cover Letter (Internship) */}
                    {type === 'internship' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-text">{t.coverLetter || 'Cover Letter'}</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI}
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-all border border-indigo-100"
                                >
                                    {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    {generatingAI ? t.generating : t.generateAI}
                                </button>
                            </div>
                            <textarea
                                value={answers.coverLetter || ''}
                                onChange={e => updateField('coverLetter', e.target.value)}
                                rows={8}
                                className="input-field resize-y"
                                placeholder="Your AI-generated cover letter will appear here..."
                            />
                        </div>
                    )}

                    {/* Why Apply (Scholarship) */}
                    {type === 'scholarship' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-text">{t.whyApply || 'Why do you want this scholarship?'}</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI}
                                    className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-all border border-purple-100"
                                >
                                    {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                                    {generatingAI ? t.generating : "Get Essay Outline"}
                                </button>
                            </div>
                            <textarea
                                value={answers.whyApply || ''}
                                onChange={e => updateField('whyApply', e.target.value)}
                                rows={6}
                                className="input-field resize-y"
                                placeholder="Write your scholarship essay or generate an outline..."
                            />

                            {/* INTERNHUB_AI_ASSISTANT: AI Essay Outline Display */}
                            {aiOutline && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
                                        <Wand2 className="w-4 h-4" />
                                        {t.aiOutline || 'AI Essay Outline'}
                                    </div>
                                    <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                                        {aiOutline}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button onClick={handleSaveDraft} className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-800 text-text font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                            <Save className="w-5 h-5" /> {t.saveDraft}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 py-3 px-6 bg-primary text-white font-bold rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            {submitting ? t.submitting : t.submitApp}
                        </button>
                    </div>
                </div>
            )}

            {/* Autofill Confirmation Modal */}
            {showAutofillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-border">
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-text">{t.autofillTitle}</h3>
                            <p className="text-sm text-muted mt-1">{t.autofillDesc}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleAutofillConfirm(false)}
                                className="py-2.5 px-4 text-sm font-bold text-muted bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                {t.autofillNo}
                            </button>
                            <button 
                                onClick={() => handleAutofillConfirm(true)}
                                className="py-2.5 px-4 text-sm font-bold text-white bg-primary rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20"
                            >
                                {t.autofillYes}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
