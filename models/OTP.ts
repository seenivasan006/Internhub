import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    email: string;
    otp: string;
    type: 'register' | 'reset';
    expires_at: Date;
}

const otpSchema = new Schema<IOTP>({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    type: { type: String, enum: ['register', 'reset'], default: 'register' },
    expires_at: { type: Date, required: true }
});

// TTL index to automatically delete expired OTPs
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
