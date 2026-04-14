import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Internship } from './models/Internship';

dotenv.config();

const checkLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const locations = await Internship.distinct('location');
        console.log('Unique Internship Locations:');
        console.log(locations);

        const indiaCount = await Internship.countDocuments({ location: /India/i });
        console.log(`\nInternships with "India" in location: ${indiaCount}`);

        const remoteCount = await Internship.countDocuments({ location: /Remote/i });
        console.log(`Internships with "Remote" in location: ${remoteCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkLocations();
