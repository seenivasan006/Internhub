import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchAdzunaInternships } from './services/apiFetch';

dotenv.config();

async function sync() {
    console.log('🔄 Manually triggering internship sync...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
    await fetchAdzunaInternships('in');
    process.exit(0);
}

sync();
