import mongoose from 'mongoose';
import { User } from './models/User';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const users = await User.find({}, 'email role isAdmin full_name');
        console.log('--- Current Users ---');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
