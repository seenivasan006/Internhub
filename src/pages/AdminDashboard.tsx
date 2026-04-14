import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, AlertCircle, CheckCircle, MessageCircle, Send } from 'lucide-react';

interface Opportunity {
    _id: string;
    title: string;
    company?: string;
    provider?: string;
    location?: string;
    source?: string;
    type: 'internship' | 'scholarship';
}

const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500'
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'opportunities' | 'support'>('opportunities');
    const [internships, setInternships] = useState<Opportunity[]>([]);
    const [scholarships, setScholarships] = useState<Opportunity[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
        fetchTickets();
    }, []);

    const fetchData = async () => {
        try {
            const [iRes, sRes] = await Promise.all([
                fetch('/api/data/internships'),
                fetch('/api/data/scholarships')
            ]);
            const iData = await iRes.json();
            const sData = await sRes.json();
            setInternships(iData.map((x: any) => ({ ...x, type: 'internship' })));
            setScholarships(sData.map((x: any) => ({ ...x, type: 'scholarship' })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support/tickets');
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string, type: 'internship' | 'scholarship') => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            const res = await fetch(`/api/data/opportunities/${id}?type=${type}`, { method: 'DELETE' });
            if (res.ok) {
                setMsg({ type: 'success', text: 'Deleted successfully' });
                if (type === 'internship') setInternships(prev => prev.filter(i => i._id !== id));
                else setScholarships(prev => prev.filter(s => s._id !== id));
            } else {
                setMsg({ type: 'error', text: 'Failed to delete' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Network error' });
        }
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    // INTERNHUB_UPDATE: Admin ticket management
    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        try {
            const res = await fetch(`/api/support/tickets/${selectedTicket._id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyText })
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedTicket(data.ticket);
                setReplyText('');
                fetchTickets();
            }
        } catch (err) { console.error(err); }
    };

    const changeTicketStatus = async (ticketId: string, status: string) => {
        try {
            await fetch(`/api/support/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchTickets();
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket((prev: any) => prev ? { ...prev, status } : null);
            }
        } catch (err) { console.error(err); }
    };

    // INTERNHUB_PHASE1_UPDATE: Manual sync trigger
    const handleSync = async () => {
        setMsg({ type: 'success', text: 'Scrapers triggered. This may take a few minutes...' });
        try {
            const res = await fetch('/api/admin/sync-scrapers', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to trigger');
            const data = await res.json();
            setMsg({ type: 'success', text: data.message });
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to start scrapers' });
        }
        setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    };

    if (!user || (!user.isAdmin && user.role !== 'admin')) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted">You do not have administrative privileges.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button 
                        onClick={handleSync}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-all flex items-center gap-2"
                    >
                        🔄 Run Scrapers
                    </button>
                </div>
                {msg.text && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {msg.text}
                    </div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('opportunities')} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'opportunities' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted'}`}>
                    Opportunities
                </button>
                <button onClick={() => setActiveTab('support')} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'support' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-muted'}`}>
                    <MessageCircle className="w-4 h-4" /> Support Tickets
                    {tickets.filter(t => t.status === 'open').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tickets.filter(t => t.status === 'open').length}</span>
                    )}
                </button>
            </div>

            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
                loading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex justify-between">
                                Recent Internships <span className="text-sm font-normal text-muted">{internships.length} total</span>
                            </h2>
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                                {internships.map(i => (
                                    <div key={i._id} className="p-3 border rounded-lg hover:bg-muted/10 flex justify-between items-center">
                                        <div><p className="font-bold text-sm truncate max-w-[200px]">{i.title}</p><p className="text-xs text-muted">{i.company} • {i.location}</p></div>
                                        <button onClick={() => handleDelete(i._id, 'internship')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4 flex justify-between">
                                Recent Scholarships <span className="text-sm font-normal text-muted">{scholarships.length} total</span>
                            </h2>
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
                                {scholarships.map(s => (
                                    <div key={s._id} className="p-3 border rounded-lg hover:bg-muted/10 flex justify-between items-center">
                                        <div><p className="font-bold text-sm truncate max-w-[200px]">{s.title}</p><p className="text-xs text-muted">{s.provider}</p></div>
                                        <button onClick={() => handleDelete(s._id, 'scholarship')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'support' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket List */}
                    <div className="lg:col-span-1 card space-y-3 max-h-[70vh] overflow-y-auto">
                        <h3 className="font-bold text-text sticky top-0 bg-card pb-2 border-b border-border">All Tickets ({tickets.length})</h3>
                        {tickets.map(ticket => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTicket?._id === ticket._id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <p className="font-bold text-sm truncate">{ticket.subject}</p>
                                <p className="text-xs text-muted mt-1">{ticket.userName} • {ticket.userEmail}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[ticket.status] || ''}`}>{ticket.status.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Ticket Detail */}
                    <div className="lg:col-span-2 card">
                        {selectedTicket ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-text">{selectedTicket.subject}</h3>
                                        <p className="text-xs text-muted">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                                    </div>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={e => changeTicketStatus(selectedTicket._id, e.target.value)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border bg-card"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border">
                                    {(selectedTicket.messages || []).map((msg: any, i: number) => (
                                        <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-primary text-white rounded-br-md' : 'bg-white dark:bg-gray-800 text-text border border-border rounded-bl-md'}`}>
                                                <p className="text-[10px] font-bold mb-1 opacity-70">{msg.sender === 'admin' ? 'Admin' : selectedTicket.userName}</p>
                                                <p>{msg.message}</p>
                                                <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-blue-100' : 'text-muted'}`}>{new Date(msg.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedTicket.status !== 'closed' && (
                                    <div className="flex gap-2">
                                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="Reply as admin..." className="input-field flex-1" />
                                        <button onClick={handleReply} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"><Send className="w-5 h-5" /></button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <MessageCircle className="w-12 h-12 text-muted mb-4" />
                                <p className="text-muted">Select a ticket to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
