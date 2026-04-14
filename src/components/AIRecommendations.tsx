// INTERNHUB_AI_MATCHING: AI-powered recommendation component
// Fetches resume-matched opportunities from /api/recommendations/ai

import { useState, useEffect } from 'react';
import { Sparkles, Briefcase, GraduationCap, Upload, Star, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIOpportunity {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: 'internship' | 'scholarship';
    match_score: number;
    stipend?: string;
    amount?: string;
    deadline?: string;
    external_url?: string;
    is_new?: boolean;
    source: string; // INTERNHUB_UPDATE
}

interface AIResponse {
    opportunities: AIOpportunity[];
    hasResume: boolean;
    skillCount: number;
    message: string | null;
}

const matchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200';
    return 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200';
};

const matchStars = (score: number) => {
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
};

export default function AIRecommendations() {
    const [data, setData] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/recommendations/ai')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load');
                return res.json();
            })
            .then(setData)
            .catch(() => setError('Could not load AI recommendations.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 gap-3 text-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running AI matching engine...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    // No skills — prompt resume upload
    if (data?.message || (data?.skillCount === 0)) {
        return (
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-200 dark:border-slate-700 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
                <h3 className="text-lg font-bold text-text">AI-Powered Recommendations</h3>
                <p className="text-sm text-muted max-w-md mx-auto">
                    {data?.message || 'Upload your resume to get personalised AI recommendations.'}
                </p>
                <button
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Upload Resume
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-text">AI Recommended Opportunities</h3>
                </div>
                <span className="text-xs text-muted bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    Based on {data!.skillCount} skills
                </span>
            </div>

            {data!.opportunities.length === 0 ? (
                <p className="text-muted text-sm">No strong matches found. Try adding more skills to your profile.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {data?.opportunities?.map(opp => (
                        <div key={opp._id} className="card hover:border-indigo-500/40 transition-all space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${opp.type === 'internship' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                                        {opp.type === 'internship'
                                            ? <Briefcase className="w-4 h-4 text-blue-600" />
                                            : <GraduationCap className="w-4 h-4 text-purple-600" />
                                        }
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text leading-tight">{opp.title}</h4>
                                        <p className="text-sm text-muted">{opp.company}</p>
                                        {opp.location && <p className="text-xs text-muted">{opp.location}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {opp.is_new && (
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">NEW</span>
                                    )}
                                    <span className="text-[9px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">{opp.source}</span>
                                </div>
                            </div>

                            {/* Match Score */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${matchColor(opp.match_score)}`}>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: matchStars(opp.match_score) }).map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                    ))}
                                </div>
                                <span className="text-sm font-bold">Match: {opp.match_score}%</span>
                            </div>

                            {/* Details */}
                            <div className="flex items-center gap-3 text-xs text-muted">
                                <span className={`font-bold uppercase ${opp.type === 'internship' ? 'text-blue-600' : 'text-purple-600'}`}>
                                    {opp.type}
                                </span>
                                {opp.stipend && <span className="text-green-600 font-bold">{opp.stipend}</span>}
                                {opp.amount && <span className="text-green-600 font-bold">{opp.amount}</span>}
                                {opp.deadline && <span>Due: {new Date(opp.deadline).toLocaleDateString()}</span>}
                            </div>

                            {/* Apply Button */}
                            {opp.external_url && (
                                <a
                                    href={opp.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    Apply Now <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
