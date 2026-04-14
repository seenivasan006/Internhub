import mongoose, { Document, Schema } from 'mongoose';

export interface IInternship extends Document {
    title: string;
    company: string;
    description: string;
    skills_required: string[];
    location: string;
    stipend?: string;
    duration?: string;
    deadline?: Date;
    source: string;
    external_url: string;
    created_at: Date;
    scraped_at: Date; // INTERNHUB_PHASE1_UPDATE
    is_new: boolean;
    status: string; // INTERNHUB_PHASE1_UPDATE
    providerId?: mongoose.Types.ObjectId; // For manually added provider opportunities
}

const internshipSchema = new Schema<IInternship>({
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    description: { type: String, required: true },
    skills_required: [{ type: String, index: true }],
    location: { type: String },
    stipend: { type: String },
    duration: { type: String },
    deadline: { type: Date, index: true },
    source: { type: String, required: true },
    external_url: { type: String, required: true },
    created_at: { type: Date, default: Date.now, index: true },
    scraped_at: { type: Date, default: Date.now }, // INTERNHUB_PHASE1_UPDATE
    is_new: { type: Boolean, default: true },
    status: { type: String, default: 'open', index: true }, // INTERNHUB_PHASE1_UPDATE
    providerId: { type: Schema.Types.ObjectId, ref: 'User', index: true }
});

// Prevent duplicates from external API updates
internshipSchema.index({ title: 1, company: 1, external_url: 1 }, { unique: true });

export const Internship = mongoose.model<IInternship>('Internship', internshipSchema);
