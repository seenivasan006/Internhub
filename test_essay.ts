import dotenv from 'dotenv';
import { generateEssay } from './services/aiService';

dotenv.config();

const testEssay = async () => {
    console.log('Testing essay generation...');
    console.log('API KEY type:', typeof process.env.AI_API_KEY, 'length:', process.env.AI_API_KEY?.length);
    
    try {
        const essay = await generateEssay(
            "Test Scholarship",
            "Be a great engineer",
            "Won a coding competition",
            "I love programming"
        );
        console.log('Success! Essay:');
        console.log(essay.substring(0, 100) + '...');
        process.exit(0);
    } catch (err: any) {
        console.error('\n==== Essay Test Failed ====');
        console.error(err.message || err);
        process.exit(1);
    }
};

testEssay();
