import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const checkUserDetail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const users = await User.find({});
        users.forEach(u => {
            console.log(`\n--- User: ${u.email} ---`);
            console.log(`Location: ${u.location}`);
            console.log(`State: ${u.state}`);
            console.log(`Skills: ${u.skills?.join(', ')}`);
            console.log(`Location Pref: ${u.location_preference}`);
            console.log(`Internship Pref Skills: ${u.internshipPreferences?.skills?.join(', ')}`);
            console.log(`Internship Pref Location: ${u.internshipPreferences?.preferredLocation}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkUserDetail();
