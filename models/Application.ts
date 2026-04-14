// INTERNHUB_UPDATE: Application model for one-click apply & tracking
import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
    userId: mongoose.Types.ObjectId;
    opportunityId: mongoose.Types.ObjectId;
    opportunityTitle: string;
    opportunityProvider: string;
    type: 'internship' | 'scholarship';
    status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'canceled';
    opportunityUrl: string; // INTERNHUB_UPDATE: Redirect to official portal
    answers: Map<string, string>;
    attachments: string[];
    submittedAt?: Date;
    lastUpdated: Date;
    createdAt: Date;
}

const applicationSchema = new Schema<IApplication>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opportunityId: { type: Schema.Types.ObjectId, required: true, index: true },
    opportunityTitle: { type: String, required: true },
    opportunityProvider: { type: String, required: true },
    type: { type: String, enum: ['internship', 'scholarship'], required: true },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'canceled'],
        default: 'draft'
    },
    opportunityUrl: { type: String, required: true },
    answers: {
        type: Map,
        of: String,
        default: new Map()
    },
    attachments: [{ type: String }],
    submittedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate applications for the same opportunity
applicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
