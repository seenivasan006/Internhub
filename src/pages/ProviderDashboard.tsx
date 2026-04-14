import { useState, useEffect } from 'react';
import { Briefcase, Users, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, ExternalLink, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'opportunities' | 'applications' | 'profile';

export default function ProviderDashboard() {
    const { } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('opportunities');
    const [loading, setLoading] = useState(true);
    const [internships, setInternships] = useState<any[]>([]);
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedOppId, setSelectedOppId] = useState<string>('');
    const [profile, setProfile] = useState<any>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [oppRes, profileRes] = await Promise.all([
                fetch('/api/provider/opportunities'),
                fetch('/api/auth/me')
            ]);
            const oppData = await oppRes.json();
            const profileData = await profileRes.json();

            setInternships(oppData.internships || []);
            setScholarships(oppData.scholarships || []);
            setProfile(profileData.user || null);

            if (oppData.internships?.length > 0) {
                setSelectedOppId(oppData.internships[0]._id);
                fetchApplications(oppData.internships[0]._id);
            } else if (oppData.scholarships?.length > 0) {
                setSelectedOppId(oppData.scholarships[0]._id);
                fetchApplications(oppData.scholarships[0]._id);
            }
        } catch (err) {
            console.error('Data fetch failed', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async (oppId: string) => {
        if (!oppId) return;
        try {
            const res = await fetch(`/api/provider/opportunities/${oppId}/applications`);
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (err) {
            console.error('Failed to fetch applications');
        }
    };

    const updateAppStatus = async (appId: string, status: string) => {
        try {
            const res = await fetch(`/api/provider/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setApplications(prev => prev.map(app => app._id === appId ? { ...app, status } : app));
                setMessage('Status updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage('Failed to update status');
        }
    };

    const handleDeleteOpp = async (id: string, type: 'internship' | 'scholarship') => {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;
        try {
            const res = await fetch(`/api/provider/opportunities/${id}?type=${type}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (type === 'internship') setInternships(prev => prev.filter(o => o._id !== id));
                else setScholarships(prev => prev.filter(o => o._id !== id));
            }
        } catch (err) {
            console.error('Delete failed');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text">Provider Dashboard</h1>
                    <p className="text-muted">Manage your opportunities and track applicants</p>
                </div>
                {profile?.providerProfile?.logo && (
                    <img src={profile.providerProfile.logo} alt="Company Logo" className="h-12 w-auto object-contain" />
                )}
            </header>

            {message && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl font-medium">
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                {(['opportunities', 'applications', 'profile'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted hover:text-text'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* content */}
            <main className="min-h-[50vh]">
                {activeTab === 'opportunities' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">My Opportunities</h2>
                            <button className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Post New
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[...internships, ...scholarships].map(opp => (
                                <div key={opp._id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-text">{opp.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${opp.providerId ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-700'}`}>
                                                {opp.stipend ? 'Internship' : 'Scholarship'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location || 'Remote'}</span>
                                            {opp.stipend && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {opp.stipend}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOpp(opp._id, opp.stipend ? 'internship' : 'scholarship')}
                                            className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedOppId(opp._id); fetchApplications(opp._id); setActiveTab('applications'); }}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-text rounded-lg text-sm font-bold hover:bg-gray-200"
                                        >
                                            View Applicants
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold text-text">Applicants & Tracking</h2>
                            <select
                                value={selectedOppId}
                                onChange={(e) => { setSelectedOppId(e.target.value); fetchApplications(e.target.value); }}
                                className="input-field max-w-xs"
                            >
                                {[...internships, ...scholarships].map(o => (
                                    <option key={o._id} value={o._id}>{o.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="text-muted text-sm px-4">
                                        <th className="pb-2 font-medium px-4">Applicant</th>
                                        <th className="pb-2 font-medium px-4">Status</th>
                                        <th className="pb-2 font-medium px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center py-10 text-muted bg-gray-50/50 rounded-xl">No applications yet.</td></tr>
                                    ) : (
                                        applications.map(app => (
                                            <tr key={app._id} className="bg-white dark:bg-gray-900 border border-border group">
                                                <td className="py-4 px-4 rounded-l-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {app.userId?.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text">{app.userId?.full_name || 'Anonymous Student'}</div>
                                                            <div className="text-xs text-muted font-medium">{app.userId?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right rounded-r-xl">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => updateAppStatus(app._id, 'shortlisted')}
                                                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg" title="Shortlist"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppStatus(app._id, 'accepted')}
                                                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg" title="Accept"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppStatus(app._id, 'rejected')}
                                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg" title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                        <a href={app.userId?.resumeUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-primary/5 text-primary rounded-lg">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && profile && (
                    <div className="max-w-2xl space-y-8">
                        <div className="card p-8 space-y-6">
                            <h2 className="text-xl font-bold text-text">Company Profile</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Company Name</label>
                                    <input type="text" className="input-field" defaultValue={profile.providerProfile?.companyName} readOnly />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Website</label>
                                        <input type="text" className="input-field" defaultValue={profile.providerProfile?.companyWebsite} readOnly />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Contact Email</label>
                                        <input type="email" className="input-field" defaultValue={profile.providerProfile?.contactEmail} readOnly />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">About Company</label>
                                    <textarea className="input-field h-32" defaultValue={profile.providerProfile?.description} readOnly />
                                </div>
                            </div>
                        </div>

                        <div className="card p-8 border-amber-200 bg-amber-50/30">
                            <h3 className="text-lg font-bold text-amber-800 mb-2">Account Status</h3>
                            <div className="flex items-center gap-2">
                                {profile.approved ? (
                                    <><CheckCircle className="w-5 h-5 text-green-600" /> <span className="text-green-700 font-bold">Approved & Verified</span></>
                                ) : (
                                    <><Clock className="w-5 h-5 text-amber-600" /> <span className="text-amber-700 font-bold">Pending Admin Approval</span></>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
