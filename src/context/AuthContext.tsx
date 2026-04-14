import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestLocation } from '../services/locationService';

interface User {
    _id: string;
    email: string;
    full_name: string;
    preferred_language: string;
    location?: string;
    state?: string;
    community?: string;
    education_level?: string;
    field_of_study?: string;
    income?: number;
    skills: string[];
    onboarding_completed: boolean;
    college_or_company?: string;
    resume_link?: string;
    degree?: string;
    hasPassword?: boolean;
    religion?: string;
    aadhaar_last_four?: string;
    academic_marks?: number;
    location_preference?: string;
    preferred_company_types?: string[];
    min_stipend?: number;
    preferred_duration?: number;
    notification_enabled?: boolean;
    notification_frequency?: 'daily' | 'weekly';
    isAdmin?: boolean;
    role?: 'student' | 'admin' | 'provider';
    approved?: boolean;
    providerProfile?: {
        companyName: string;
        companyWebsite: string;
        contactEmail: string;
        description: string;
        logo: string;
    };
    // Enhanced Profile Fields (PART 2)
    educationLevel?: string;
    gender?: string;
    collegeName?: string;
    annualIncome?: number;
    dateOfBirth?: Date;

    // Forgot Password Fields (PART 3)
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

    internshipPreferences?: {
        skills: string[];
        preferredLocation: string;
        companyType: string;
        stipendRange: string;
        duration: string;
    };
    scholarshipPreferences?: {
        fieldOfStudy: string;
        eligibilityCriteria: string;
        preferredLocation: string;
        amountRange: string;
    };
    resumeUrl?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: { user: User }) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            // If sessionStorage is empty, it means this is a newly opened tab or the browser was closed.
            // We clear any lingering cookies (e.g. from Chrome's "Continue where you left off")
            if (!sessionStorage.getItem('internhub_session')) {
                await fetch('/api/auth/logout', { method: 'POST' });
                sessionStorage.setItem('internhub_session', 'true');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Inactivity Timer
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const resetTimeout = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (user) {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setUser(null);
                    window.location.href = '/login';
                }
            }, 15 * 60 * 1000); // 15 minutes
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetTimeout));
        resetTimeout();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimeout));
        };
    }, [user]);

    const login = async (data: { user: User }) => {
        setUser(data.user);

        // INTERNHUB_UPDATE: Request location after login
        try {
            const loc = await requestLocation();
            if (loc.city) {
                const res = await fetch('/api/profile/location', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: loc.city, state: loc.state })
                });
                if (res.ok) {
                    setUser(prev => prev ? { ...prev, location: loc.city, state: loc.state } : null);
                    console.log('📍 Location updated after login:', loc.city);
                }
            }
        } catch (err) {
            console.log('Location permission denied or geocoding failed');
        }
    };
    const logout = () => setUser(null);
    const updateUser = (updates: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
