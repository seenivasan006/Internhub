import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string | null;
    full_name: string;
    googleId?: string | null;
    preferred_language: string;
    location?: string | null; // e.g City
    state?: string | null;
    skills: string[];
    onboarding_completed: boolean;
    education_level?: string | null;    // High School, UG, PG, PhD
    field_of_study?: string | null;     // Singular string as per spec
    community?: string | null;          // SC, ST, OBC, General, Minority
    income?: number | null;             // Numeric representation of family income
    gender?: string | null;             // Male, Female, Other
    citizenship?: string | null;
    college_or_company?: string | null;
    resume_link?: string | null;
    degree?: string | null;
    saved_internships: mongoose.Types.ObjectId[];
    saved_scholarships: mongoose.Types.ObjectId[];
    religion?: string | null;
    aadhaar_last_four?: string | null;
    academic_marks?: number | null;
    location_preference?: string | null;
    preferred_company_types?: string[] | null;
    min_stipend?: number | null;
    preferred_duration?: number | null;
    notification_enabled: boolean;
    notification_frequency: 'daily' | 'weekly';
    role: 'student' | 'admin' | 'provider';
    isAdmin: boolean;
    approved?: boolean; // For providers
    providerProfile?: {
        companyName: string;
        companyWebsite: string;
        contactEmail: string;
        description: string;
        logo: string;
    };
    internshipPreferences: {
        skills: string[];
        preferredLocation: string;
        companyType: string;
        stipendRange: string;
        duration: string;
    };
    scholarshipPreferences: {
        fieldOfStudy: string;
        eligibilityCriteria: string;
        preferredLocation: string;
        amountRange: string;
    };
    resumeUrl: string;
    // Enhanced Profile Fields
    educationLevel?: string;
    collegeName?: string;
    annualIncome?: number;
    dateOfBirth?: Date;
    // Forgot Password
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    securityQuestions: {
        question: string;
        answer: string;
    }[];
    year_of_study?: number | null;
    interests: string[];
    created_at: Date;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    full_name: { type: String, required: true },
    googleId: { type: String, default: null },
    preferred_language: { type: String, default: 'English' },
    location: { type: String, default: null },
    state: { type: String, default: null },
    skills: [{ type: String }],
    onboarding_completed: { type: Boolean, default: false },
    education_level: { type: String, default: null },
    field_of_study: { type: String, default: null },
    community: { type: String, default: null },
    income: { type: Number, default: null },
    gender: { type: String, default: null },
    citizenship: { type: String, default: null },
    college_or_company: { type: String, default: null },
    resume_link: { type: String, default: null },
    degree: { type: String, default: null },
    saved_internships: [{ type: Schema.Types.ObjectId, ref: 'Internship' }],
    saved_scholarships: [{ type: Schema.Types.ObjectId, ref: 'Scholarship' }],
    religion: { type: String, default: null },
    aadhaar_last_four: { type: String, default: null },
    academic_marks: { type: Number, default: null },
    location_preference: { type: String, default: null },
    preferred_company_types: [{ type: String }],
    min_stipend: { type: Number, default: null },
    preferred_duration: { type: Number, default: null },
    notification_enabled: { type: Boolean, default: true },
    notification_frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    role: { type: String, enum: ['student', 'admin', 'provider'], default: 'student' },
    isAdmin: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    providerProfile: {
        companyName: { type: String, default: '' },
        companyWebsite: { type: String, default: '' },
        contactEmail: { type: String, default: '' },
        description: { type: String, default: '' },
        logo: { type: String, default: '' }
    },
    internshipPreferences: {
        skills: { type: [String], default: [] },
        preferredLocation: { type: String, default: '' },
        companyType: { type: String, default: '' },
        stipendRange: { type: String, default: '' },
        duration: { type: String, default: '' }
    },
    scholarshipPreferences: {
        fieldOfStudy: { type: String, default: '' },
        eligibilityCriteria: { type: String, default: '' },
        preferredLocation: { type: String, default: '' },
        amountRange: { type: String, default: '' }
    },
    resumeUrl: { type: String, default: '' },
    // Enhanced Profile Fields
    educationLevel: { type: String, default: null },
    collegeName: { type: String, default: null },
    annualIncome: { type: Number, default: null },
    dateOfBirth: { type: Date, default: null },
    // Forgot Password
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    securityQuestions: [{
        question: { type: String, required: true },
        answer: { type: String, required: true }
    }],
    year_of_study: { type: Number, default: null },
    interests: [{ type: String, default: [] }],
    created_at: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema);
