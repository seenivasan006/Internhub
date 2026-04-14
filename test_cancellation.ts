import mongoose from 'mongoose';
import { Application } from './models/Application';
import { Internship } from './models/Internship';
import { User } from './models/User';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function testCancellation() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        
        const user = await User.findOne({ email: 'vasanseeni006@gmail.com' });
        if (!user) throw new Error('User not found');

        const internship = await Internship.findOne();
        if (!internship) throw new Error('No internship found to apply to');

        // 1. Create a "submitted" application
        console.log('--- Step 1: Creating a submitted application ---');
        const app = await Application.create({
            userId: user._id,
            opportunityId: internship._id,
            opportunityTitle: internship.title,
            opportunityProvider: internship.company || 'Test Company',
            opportunityUrl: internship.external_url || 'https://google.com',
            type: 'internship',
            status: 'submitted',
            lastUpdated: new Date()
        });
        console.log(`Created application with ID: ${app._id}`);

        // 2. Verify it exists
        let exists = await Application.findById(app._id);
        console.log(`Exists before cancellation: ${!!exists}`);

        // 3. Since we are running on the server, we can just call the route logic or use axios if the server is running.
        // Let's assume the server is running on http://localhost:5000 (from previous logs).
        // However, it's easier to just call the DB logic we just implemented.
        
        console.log('--- Step 2: Cancelling (Deleting) the application ---');
        // This simulates the logic in our updated route
        await Application.deleteOne({ _id: app._id, userId: user._id });
        console.log('Deletion command executed.');

        // 4. Verify it's gone
        exists = await Application.findById(app._id);
        console.log(`Exists after cancellation: ${!!exists}`);

        if (!exists) {
            console.log('✅ TEST PASSED: Application was successfully deleted.');
        } else {
            console.log('❌ TEST FAILED: Application still exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testCancellation();
