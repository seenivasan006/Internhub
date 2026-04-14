import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [language, setLanguageState] = useState<string>('English');

    // Sync with user's preferred language when they log in
    useEffect(() => {
        if (user?.preferred_language) {
            setLanguageState(user.preferred_language);
        }
    }, [user]);

    const setLanguage = (lang: string) => {
        setLanguageState(lang);
        // Note: The actual DB update is handled in settings or onboarding
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
