// INTERNHUB_UPDATE: Unified Application Tracking Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Briefcase, GraduationCap, Clock, CheckCircle, XCircle, FileEdit, Trash2, Eye, Filter, ExternalLink } from 'lucide-react';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    draft: { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800', icon: FileEdit },
    submitted: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock },
    under_review: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Eye },
    accepted: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
    rejected: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle }
};

const translations: Record<string, any> = {
    English: {
        title: 'My Applications',
        subtitle: 'Track all your internship and scholarship applications in one place.',
        noApps: 'No applications yet. Start exploring opportunities!',
        filterAll: 'All',
        filterInternships: 'Internships',
        filterScholarships: 'Scholarships',
        draft: 'Draft',
        submitted: 'Submitted',
        under_review: 'Under Review',
        accepted: 'Accepted',
        rejected: 'Rejected',
        appliedOn: 'Applied on',
        lastUpdated: 'Last updated',
        editDraft: 'Continue Editing',
        deleteDraft: 'Delete Draft',
        cancelApp: 'Cancel Application',
        viewDetails: 'View Details',
        viewPortal: 'Open Official Portal',
        loading: 'Loading applications...'
    },
    Tamil: {
        title: 'எனது விண்ணப்பங்கள்',
        subtitle: 'உங்கள் அனைத்து விண்ணப்பங்களையும் ஒரே இடத்தில் கண்காணிக்கவும்.',
        noApps: 'இன்னும் விண்ணப்பங்கள் இல்லை.',
        filterAll: 'அனைத்தும்',
        loading: 'ஏற்றுகிறது...'
    },
    Hindi: {
        title: 'मेरे आवेदन',
        subtitle: 'अपने सभी आवेदनों को एक ही जगह ट्रैक करें।',
        noApps: 'अभी तक कोई आवेदन नहीं।',
        filterAll: 'सभी',
        loading: 'लोड हो रहा है...'
    }
};

export default function MyApplications() {
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];
    const navigate = useNavigate();

    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'internship' | 'scholarship'>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/applications');
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (err) {
            console.error('Failed to fetch applications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this draft?')) return;
        try {
            await fetch(`/api/applications/${id}`, { method: 'DELETE' });
            setApplications(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this application?')) return;
        try {
            const res = await fetch(`/api/applications/${id}/cancel`, { method: 'POST' });
            if (res.ok) fetchApplications();
        } catch (err) {
            console.error('Failed to cancel', err);
        }
    };

    const filtered = applications.filter(app => {
        if (filterType !== 'all' && app.type !== filterType) return false;
        if (filterStatus !== 'all' && app.status !== filterStatus) return false;
        return true;
    });

    if (loading) return <div className="text-center py-12 text-muted">{t.loading}</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text">{t.title}</h1>
                <p className="text-muted mt-1">{t.subtitle}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    {(['all', 'internship', 'scholarship'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === f ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                        >
                            {f === 'all' ? t.filterAll : f === 'internship' ? (t.filterInternships || 'Internships') : (t.filterScholarships || 'Scholarships')}
                        </button>
                    ))}
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    {['all', 'draft', 'submitted', 'under_review', 'accepted', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${filterStatus === s ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                        >
                            {s === 'all' ? t.filterAll : (t[s] || s.replace('_', ' '))}
                        </button>
                    ))}
                </div>
            </div>

            {/* Application List */}
            {filtered.length === 0 ? (
                <div className="card text-center py-16 space-y-4">
                    <Filter className="w-12 h-12 text-muted mx-auto" />
                    <p className="text-muted font-medium">{t.noApps}</p>
                    <button onClick={() => navigate('/internships')} className="btn-primary">
                        {t.browseOpportunities || 'Browse Opportunities'}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(app => {
                        const cfg = statusConfig[app.status] || statusConfig.draft;
                        const StatusIcon = cfg.icon;
                        return (
                            <div
                                key={app._id}
                                className="card hover:shadow-md transition-shadow cursor-pointer group relative"
                                onClick={() => app.opportunityUrl && window.open(app.opportunityUrl, '_blank')}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-xl ${cfg.bg}`}>
                                            {app.type === 'internship'
                                                ? <Briefcase className={`w-6 h-6 ${cfg.color}`} />
                                                : <GraduationCap className={`w-6 h-6 ${cfg.color}`} />
                                            }
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{app.opportunityTitle}</h3>
                                                <ExternalLink className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-muted text-sm">{app.opportunityProvider}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {t[app.status] || app.status.replace('_', ' ')}
                                                </span>
                                                <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full font-medium">{app.type}</span>
                                                {app.submittedAt && (
                                                    <span>{t.appliedOn || 'Applied on'}: {new Date(app.submittedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:flex-col" onClick={e => e.stopPropagation()}>
                                        {app.status === 'draft' ? (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/apply/${app.opportunityId}?type=${app.type}`)}
                                                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <FileEdit className="w-4 h-4" /> {t.editDraft || 'Edit'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(app._id)}
                                                    className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" /> {t.deleteDraft || 'Delete'}
                                                </button>
                                            </>
                                        ) : app.status === 'submitted' || app.status === 'under_review' ? (
                                            <button
                                                onClick={() => handleCancel(app._id)}
                                                className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" /> {t.cancelApp || 'Cancel Application'}
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted">{t.lastUpdated || 'Updated'}: {new Date(app.lastUpdated).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                {app.opportunityUrl && (
                                    <div className="mt-3 pt-3 border-t border-border flex justify-end">
                                        <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                            {t.viewPortal || 'Open Official Portal'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
