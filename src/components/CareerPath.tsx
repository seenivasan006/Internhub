// INTERNHUB_PHASE2_UPDATE: Career Path Recommendation Component
// Displays three sections: Top Internship Matches, Scholarship Opportunities, Skill Gap Analysis

import { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Zap, TrendingUp, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchedInternship {
    _id: string;
    title: string;
    company: string;
    location: string;
    stipend?: string;
    skills_required: string[];
    external_url: string;
    match_score: number;
    source: string; // INTERNHUB_UPDATE
}

interface MatchedScholarship {
    _id: string;
    title: string;
    provider: string;
    amount?: string;
    deadline: string;
    official_website?: string;
    description?: string;
    match_score: number;
    source: string; // INTERNHUB_UPDATE
}

interface SuggestedScholarship {
    id: string;
    title: string;
    provider: string;
    descriptionSnippet: string;
    source: string; // INTERNHUB_UPDATE
    url: string;
}

interface SkillGap {
    skill: string;
    demandCount: number;
    suggestedScholarships: SuggestedScholarship[];
}

interface CareerPathData {
    matchedInternships: MatchedInternship[];
    matchedScholarships: MatchedScholarship[];
    skillGaps: SkillGap[];
}

const scoreColor = (score: number) => {
    if (score >= 60) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (score >= 30) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
};

export default function CareerPath() {
    const [data, setData] = useState<CareerPathData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/recommendations/career-path')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load');
                return res.json();
            })
            .then(setData)
            .catch(() => setError('Could not load career recommendations.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 gap-3 text-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analysing your career path...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error || 'No recommendations available.'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* ─── SECTION 1: Top Internship Matches ─────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-text">Top Internship Matches</h3>
                    </div>
                    <button
                        onClick={() => navigate('/internships')}
                        className="text-sm text-primary hover:underline"
                    >
                        View all →
                    </button>
                </div>

                {data.matchedInternships.length === 0 ? (
                    <p className="text-muted text-sm">No internship matches yet. Complete your profile skills to get personalised results.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.matchedInternships.slice(0, 4).map(job => (
                            <div key={job._id} className="card hover:border-primary/50 transition-all space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-text leading-tight">{job.title}</h4>
                                        <p className="text-sm text-muted">{job.company}</p>
                                        <p className="text-xs text-muted mt-0.5">{job.location}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${scoreColor(job.match_score)}`}>
                                            {job.match_score}pt
                                        </span>
                                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">{job.source}</span>
                                    </div>
                                </div>
                                {job.skills_required?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.skills_required.slice(0, 3).map(skill => (
                                            <span key={skill} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-muted rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <a
                                    href={job.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                    onClick={e => e.stopPropagation()}
                                >
                                    Apply Now <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── SECTION 2: Scholarship Opportunities ──────────────── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-text">Scholarships For You</h3>
                    </div>
                    <button
                        onClick={() => navigate('/scholarships/recommended')}
                        className="text-sm text-primary hover:underline"
                    >
                        View all →
                    </button>
                </div>

                {data.matchedScholarships.length === 0 ? (
                    <p className="text-muted text-sm">No scholarships available right now. Check back soon.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.matchedScholarships.slice(0, 4).map(schol => (
                            <div key={schol._id} className="card hover:border-purple-600/40 transition-all space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-bold text-text leading-tight">{schol.title}</h4>
                                        <p className="text-sm text-muted">{schol.provider}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${scoreColor(schol.match_score)}`}>
                                            {schol.match_score}%
                                        </span>
                                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-slate-700">{schol.source}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted">
                                    {schol.amount && <span className="text-green-600 font-bold">{schol.amount}</span>}
                                    {schol.deadline && (
                                        <span>Deadline: {new Date(schol.deadline).toLocaleDateString()}</span>
                                    )}
                                </div>
                                {schol.official_website && (
                                    <a
                                        href={schol.official_website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                                    >
                                        Apply Now <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── SECTION 3: Learning Path (Skill Gap) ─────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-amber-500" />
                        <h3 className="text-xl font-bold text-text">Your Learning Path</h3>
                    </div>
                </div>

                {data.skillGaps.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 flex items-center gap-4 transition-all hover:shadow-md">
                        <Zap className="w-8 h-8 text-green-600 flex-shrink-0 animate-pulse" />
                        <div>
                            <p className="text-lg font-bold text-green-800 dark:text-green-400">Profile Optimized!</p>
                            <p className="text-sm text-green-700 dark:text-green-500/80">
                                Your current skills align perfectly with major market demands. Focus on applying!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative pointer-events-none pb-4">
                        {/* Connecting Line Sidebar for Roadmap feel */}
                        <div className="absolute left-[19px] top-6 bottom-0 w-1 bg-gradient-to-b from-amber-200 via-purple-100 to-transparent dark:from-amber-900/30 dark:via-purple-900/20 hidden md:block" />

                        <div className="space-y-8 relative pointer-events-auto">
                            {data.skillGaps.map((gap, idx) => (
                                <div key={gap.skill} className="relative pl-0 md:pl-12 group">
                                    {/* Roadmap Dot */}
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-4 border-amber-400 hidden md:flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="text-xs font-black text-amber-600">{idx + 1}</span>
                                    </div>

                                    <div className="card border-l-4 border-l-amber-400 hover:shadow-lg transition-all bg-card dark:hover:bg-slate-800/80 overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                                                    <h4 className="text-lg font-black text-text uppercase tracking-tight">{gap.skill}</h4>
                                                </div>
                                                <p className="text-xs font-bold text-muted uppercase tracking-wider">
                                                    High Demand: Required by {gap.demandCount} Internships
                                                </p>
                                            </div>

                                            {gap.suggestedScholarships.length > 0 && (
                                                <div className="flex -space-x-2">
                                                    {gap.suggestedScholarships.map((s, i) => (
                                                        <div key={s.id} title={s.title} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[10px] font-bold text-purple-600 z-[${10 - i}]`}>
                                                            {s.provider.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {gap.suggestedScholarships.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-[10px] font-black text-muted uppercase mb-3 tracking-widest">Bridging the gap with scholarships:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {gap.suggestedScholarships.map((s) => (
                                                        <a
                                                            key={s.id}
                                                            href={s.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/10 border border-transparent hover:border-purple-200 transition-all group/item"
                                                        >
                                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                                                <GraduationCap className="w-4 h-4 text-purple-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-text truncate group-hover/item:text-purple-600 transition-colors">{s.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[10px] text-muted truncate">{s.provider}</p>
                                                                    <span className="text-[8px] text-muted font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-700 px-1 rounded">{s.source}</span>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover/item:text-purple-400" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
