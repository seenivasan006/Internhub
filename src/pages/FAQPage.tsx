// INTERNHUB_UPDATE: FAQ page with accordion-style questions
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqData = [
    {
        category: 'Getting Started',
        questions: [
            {
                q: 'How do I create an account?',
                a: 'Click "Register" on the login page. You can sign up with your email or use Google Sign-In for a quicker setup.'
            },
            {
                q: 'How do I complete my profile?',
                a: 'After registration, you\'ll be guided through onboarding. You can always update your profile later from the Settings page.'
            },
            {
                q: 'Is InternHub free to use?',
                a: 'Yes! InternHub is completely free for students. We believe everyone deserves access to quality opportunities.'
            }
        ]
    },
    {
        category: 'Applications',
        questions: [
            {
                q: 'How does one-click apply work?',
                a: 'When you click "Apply" on an opportunity, InternHub automatically fills in your details from your profile. You just review, customize if needed, and submit!'
            },
            {
                q: 'Can I save a draft and finish later?',
                a: 'Absolutely! Click "Save Draft" on the Apply page. You can resume editing from the "My Applications" section anytime.'
            },
            {
                q: 'How do I track my applications?',
                a: 'Go to "My Applications" from the sidebar. You\'ll see all your applications with real-time status updates.'
            },
            {
                q: 'Can I withdraw a submitted application?',
                a: 'Currently, submitted applications cannot be withdrawn. Please review carefully before submitting.'
            }
        ]
    },
    {
        category: 'Internships & Scholarships',
        questions: [
            {
                q: 'How are recommendations generated?',
                a: 'Our AI analyzes your skills, education, location, and preferences to find the best matches. The more complete your profile, the better the recommendations!'
            },
            {
                q: 'How often is new data added?',
                a: 'Our system automatically fetches new opportunities multiple times a day from trusted sources like Adzuna and government portals.'
            },
            {
                q: 'Can I filter scholarships by my state?',
                a: 'Yes! Enable location permissions and InternHub will automatically show local scholarships that match your profile.'
            }
        ]
    },
    {
        category: 'Account & Support',
        questions: [
            {
                q: 'How do I upload my resume?',
                a: 'Go to Settings → Documents tab → Upload Resume. Only PDF files up to 5MB are accepted.'
            },
            {
                q: 'How do I contact support?',
                a: 'Visit the Support page from the sidebar. You can create a ticket and our team will respond within 24 hours.'
            },
            {
                q: 'Can I change my email address?',
                a: 'For security reasons, email changes require contacting support. Please submit a ticket with your request.'
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenIndex(prev => prev === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <HelpCircle className="w-12 h-12 text-primary mx-auto" />
                <h1 className="text-3xl font-bold text-text">Frequently Asked Questions</h1>
                <p className="text-muted">Find answers to common questions about InternHub.</p>
            </div>

            {faqData.map((section, si) => (
                <div key={si} className="space-y-3">
                    <h2 className="text-lg font-bold text-text border-b border-border pb-2">{section.category}</h2>
                    {section.questions.map((item, qi) => {
                        const id = `${si}-${qi}`;
                        const isOpen = openIndex === id;
                        return (
                            <div key={id} className="card !p-0 overflow-hidden">
                                <button
                                    onClick={() => toggle(id)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <span className="font-medium text-text pr-4">{item.q}</span>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-muted flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />}
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-4 text-sm text-muted leading-relaxed border-t border-border pt-3 bg-gray-50/50 dark:bg-gray-900/30">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className="text-center card bg-primary/5 border-primary/20">
                <p className="text-text font-medium mb-3">Still have questions?</p>
                <Link to="/support" className="btn-primary inline-flex items-center gap-2">
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
