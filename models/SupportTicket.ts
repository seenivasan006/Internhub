// INTERNHUB_UPDATE: Support ticket model for in-app helpdesk
import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketMessage {
    sender: 'user' | 'admin';
    message: string;
    timestamp: Date;
}

export interface ISupportTicket extends Document {
    userId: mongoose.Types.ObjectId;
    userName: string;
    userEmail: string;
    subject: string;
    description: string;
    category: 'general' | 'application' | 'technical' | 'billing' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    messages: ITicketMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['general', 'application', 'technical', 'billing', 'other'],
        default: 'general'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
