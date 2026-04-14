// INTERNHUB_UPDATE: In-app support ticket system
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Send, Plus, ArrowLeft, MessageCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const translations: Record<string, any> = {
    English: {
        title: 'Support Center',
        subtitle: 'We\'re here to help. Submit a ticket and our team will respond promptly.',
        myTickets: 'My Tickets',
        newTicket: 'New Ticket',
        noTickets: 'No support tickets yet.',
        subject: 'Subject',
        description: 'Describe your issue',
        category: 'Category',
        submit: 'Submit Ticket',
        submitting: 'Submitting...',
        reply: 'Type your reply...',
        send: 'Send',
        back: 'Back to tickets',
        created: 'Created',
        faq: 'Browse FAQ',
        success: 'Ticket created! Our team will respond soon.',
        categories: {
            general: 'General',
            application: 'Application Issues',
            technical: 'Technical Problem',
            billing: 'Billing',
            other: 'Other'
        }
    }
};

const statusStyles: Record<string, { color: string; bg: string }> = {
    open: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    in_progress: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    resolved: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    closed: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
};

export default function SupportPage() {
    const { language } = useLanguage();
    const t = translations[language] || translations['English'];

    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [replyText, setReplyText] = useState('');

    // New ticket form
    const [newSubject, setNewSubject] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState('general');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchTickets(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket?.messages]);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support/tickets');
            const data = await res.json();
            setTickets(data.tickets || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTicket = async () => {
        if (!newSubject.trim() || !newDescription.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: newSubject, description: newDescription, category: newCategory })
            });
            if (res.ok) {
                setMessage(t.success);
                setNewSubject(''); setNewDescription(''); setNewCategory('general');
                setView('list');
                fetchTickets();
            }
        } catch (err) {
            setMessage('Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const openTicket = async (ticketId: string) => {
        try {
            const res = await fetch(`/api/support/tickets/${ticketId}`);
            const data = await res.json();
            setSelectedTicket(data.ticket);
            setView('detail');
        } catch (err) {
            console.error(err);
        }
    };

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
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text">{t.title}</h1>
                    <p className="text-muted mt-1">{t.subtitle}</p>
                </div>
                <Link to="/faq" className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                    <HelpCircle className="w-4 h-4" /> {t.faq}
                </Link>
            </div>

            {message && (
                <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> <span className="font-medium">{message}</span>
                </div>
            )}

            {/* List View */}
            {view === 'list' && (
                <div className="space-y-4">
                    <button onClick={() => { setView('create'); setMessage(''); }} className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> {t.newTicket}
                    </button>

                    {tickets.length === 0 ? (
                        <div className="card text-center py-12">
                            <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
                            <p className="text-muted">{t.noTickets}</p>
                        </div>
                    ) : (
                        tickets.map(ticket => {
                            const style = statusStyles[ticket.status] || statusStyles.open;
                            return (
                                <div
                                    key={ticket._id}
                                    onClick={() => openTicket(ticket._id)}
                                    className="card hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-text">{ticket.subject}</h3>
                                            <p className="text-sm text-muted mt-1 line-clamp-1">{ticket.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${style.bg} ${style.color}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Create View */}
            {view === 'create' && (
                <div className="card space-y-5">
                    <button onClick={() => setView('list')} className="flex items-center text-muted hover:text-text text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t.back}
                    </button>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t.category}</label>
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="input-field">
                            {Object.entries(t.categories || {}).map(([k, v]) => (
                                <option key={k} value={k}>{v as string}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t.subject}</label>
                        <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} className="input-field" placeholder="Brief summary of your issue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t.description}</label>
                        <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={6} className="input-field resize-y" placeholder="Tell us more..." />
                    </div>
                    <button onClick={handleCreateTicket} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" /> {submitting ? t.submitting : t.submit}
                    </button>
                </div>
            )}

            {/* Detail / Chat View */}
            {view === 'detail' && selectedTicket && (
                <div className="card space-y-4">
                    <button onClick={() => { setView('list'); setSelectedTicket(null); }} className="flex items-center text-muted hover:text-text text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t.back}
                    </button>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text">{selectedTicket.subject}</h2>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${(statusStyles[selectedTicket.status] || statusStyles.open).bg} ${(statusStyles[selectedTicket.status] || statusStyles.open).color}`}>
                            {selectedTicket.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border">
                        {(selectedTicket.messages || []).map((msg: any, i: number) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-white dark:bg-gray-800 text-text border border-border rounded-bl-md'}`}>
                                    <p>{msg.message}</p>
                                    <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-muted'}`}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply */}
                    {selectedTicket.status !== 'closed' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReply()}
                                placeholder={t.reply}
                                className="input-field flex-1"
                            />
                            <button onClick={handleReply} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent transition-all">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
