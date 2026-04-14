import React from 'react';
import { X, MapPin, DollarSign, Calendar, Globe, Briefcase, GraduationCap } from 'lucide-react';
import { ensureAbsoluteUrl } from '../utils/url';
import { useNavigate } from 'react-router-dom';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    type: 'internship' | 'scholarship';
}

export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data, type }) => {
    const navigate = useNavigate();
    if (!isOpen || !data) return null;

    const isScholarship = type === 'scholarship';

    const handleApplyInApp = () => {
        onClose();
        navigate(`/apply/${data._id}?type=${type}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col md:flex-row border border-border">

                {/* Left Sidebar - Action Area */}
                <div className="w-full md:w-80 bg-gray-50 dark:bg-slate-800/50 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        {isScholarship ? (
                            <GraduationCap className="w-10 h-10 text-primary" />
                        ) : (
                            <Briefcase className="w-10 h-10 text-primary" />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-text mb-2 leading-tight">
                        {isScholarship ? data.provider : data.company}
                    </h3>

                    <div className="flex flex-col gap-3 w-full mt-6">
                        {/* INTERNHUB_UPDATE: In-app Apply button */}
                        <button
                            onClick={handleApplyInApp}
                            className="w-full py-3 px-6 bg-primary text-white font-bold rounded-xl hover:bg-accent transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Apply in InternHub
                        </button>
                        {(data.external_url || data.official_website) && (
                            <a
                                href={ensureAbsoluteUrl(data.external_url || data.official_website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 px-6 bg-card text-text font-medium rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Globe className="w-4 h-4" /> View External Site
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-6 bg-card text-muted font-medium rounded-xl border border-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-8 text-left w-full space-y-4">
                        <div className="flex items-center text-sm text-muted">
                            <Globe className="w-4 h-4 mr-3 text-primary" />
                            <span className="truncate">{data.source || 'Official Portal'}</span>
                        </div>
                        {data.deadline && (
                            <div className="flex items-center text-sm text-muted">
                                <Calendar className="w-4 h-4 mr-3 text-red-500" />
                                <span>Deadline: {new Date(data.deadline).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area - Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 text-muted hover:text-text hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            {isScholarship ? 'Scholarship Opportunity' : 'Internship Opening'}
                        </span>

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-text">
                                {data.title}
                            </h2>
                            <span className="text-[10px] text-muted font-bold uppercase tracking-widest bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-border">Source: {data.source || 'Official'}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase">Location</p>
                                    <p className="text-text font-medium">{data.location || data.state || 'India (National)'}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <DollarSign className="w-5 h-5 mr-3 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase">{isScholarship ? 'Amount' : 'Stipend'}</p>
                                    <p className="text-text font-medium">{data.amount || data.stipend || 'Competitive'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h4 className="text-lg font-bold text-text mb-3 border-b border-border pb-2">Description</h4>
                                <p className="text-muted leading-relaxed whitespace-pre-wrap">
                                    {data.description}
                                </p>
                            </section>

                            <section>
                                <h4 className="text-lg font-bold text-text mb-3 border-b border-border pb-2">Eligibility & Requirements</h4>
                                <ul className="space-y-3">
                                    {data.education_level && (
                                        <li className="flex items-center text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                                            <span>Education: <strong>{data.education_level}</strong></span>
                                        </li>
                                    )}
                                    {data.community && (
                                        <li className="flex items-center text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                                            <span>Category/Community: <strong>{data.community}</strong></span>
                                        </li>
                                    )}
                                    {data.income_limit && (
                                        <li className="flex items-center text-muted">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                                            <span>Family Income Limit: <strong>₹{data.income_limit} per annum</strong></span>
                                        </li>
                                    )}
                                    {data.skills_required?.length > 0 && (
                                        <li className="flex flex-col gap-2">
                                            <div className="flex items-center text-muted">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                                                <span>Preferred Skills:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 ml-4 mt-1">
                                                {data.skills_required.map((skill: string) => (
                                                    <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded text-xs text-muted">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
