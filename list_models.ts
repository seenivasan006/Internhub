import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const API_KEY = process.env.AI_API_KEY;
    if (!API_KEY) {
        console.error('AI_API_KEY not found');
        return;
    }
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
