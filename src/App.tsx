/// <reference types="vite/client" />
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './components/Layout';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import InternshipSearch from './pages/InternshipSearch';
import ScholarshipSearch from './pages/ScholarshipSearch';
import RecommendedScholarships from './pages/RecommendedScholarships';
import EssayGenerator from './pages/EssayGenerator';
import SavedItems from './pages/SavedItems';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ApplyPage from './pages/ApplyPage';
import MyApplications from './pages/MyApplications';
import ProviderDashboard from './pages/ProviderDashboard';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
                        <Router>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/register" element={<Register />} />

                                {/* Protected Onboarding */}
                                <Route path="/onboarding" element={<Onboarding />} />

                                {/* Protected App Shell Routes */}
                                <Route element={<Layout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/internships" element={<InternshipSearch />} />
                                    <Route path="/scholarships" element={<ScholarshipSearch />} />
                                    <Route path="/scholarships/recommended" element={<RecommendedScholarships />} />
                                    <Route path="/saved" element={<SavedItems />} />
                                    <Route path="/essay" element={<EssayGenerator />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/admin" element={<AdminDashboard />} />
                                    <Route path="/provider" element={<ProviderDashboard />} />
                                    <Route path="/apply/:opportunityId" element={<ApplyPage />} />
                                    <Route path="/applications" element={<MyApplications />} />
                                    <Route path="/support" element={<SupportPage />} />
                                    <Route path="/faq" element={<FAQPage />} />
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                </Route>
                            </Routes>
                        </Router>
                    </GoogleOAuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
