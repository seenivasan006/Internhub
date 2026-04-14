import mongoose from 'mongoose';
import { User } from './models/User';
import dotenv from 'dotenv';

dotenv.config();

async function promoteAdmin() {
    const email = 'vasanseeni006@gmail.com';
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin', isAdmin: true },
            { new: true }
        );
        if (user) {
            console.log(`✅ User ${email} promoted to admin!`);
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log(`❌ User ${email} not found.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

promoteAdmin();
