import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarship extends Document {
    title: string;
    provider: string;
    description?: string;
    official_website?: string;

    amount?: string;
    currency: string;
    coverage_type?: string;
    renewable?: boolean;

    education_level: string;
    minimum_percentage?: number;
    fields_of_study: string[];
    citizenship?: string;
    gender?: string;
    community?: string;
    income_limit?: number;
    state?: string;
    age_limit?: number;
    religion?: string;

    application_start_date?: Date;
    deadline: Date;
    application_mode?: string;
    documents_required: string[];
    selection_process?: string;

    is_verified: boolean;
    is_featured: boolean;
    is_active: boolean;

    source?: string;
    providerId?: mongoose.Types.ObjectId; // For manually added provider opportunities
    created_at: Date;
    expires_at?: Date;
}

const scholarshipSchema = new Schema<IScholarship>({
    title: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    description: { type: String },
    official_website: { type: String },

    amount: { type: String },
    currency: { type: String, default: 'INR' },
    coverage_type: { type: String },
    renewable: { type: Boolean },

    education_level: { type: String, required: true, index: true },
    minimum_percentage: { type: Number },
    fields_of_study: [{ type: String, index: true }],
    citizenship: { type: String },
    gender: { type: String, default: 'All' },
    community: { type: String, default: 'All', index: true },
    income_limit: { type: Number, index: true },
    state: { type: String, default: 'All', index: true },
    religion: { type: String, default: 'All', index: true },
    age_limit: { type: Number },

    application_start_date: { type: Date },
    deadline: { type: Date, required: true, index: true },
    application_mode: { type: String },
    documents_required: [{ type: String }],
    selection_process: { type: String },

    is_verified: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true, index: true },

    source: { type: String },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date }
});

export const Scholarship = mongoose.model<IScholarship>('Scholarship', scholarshipSchema);
