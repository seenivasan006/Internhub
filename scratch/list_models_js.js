const dotenv = require('dotenv');
const path = require('path');
// Fix path to look in the parent directory where .env is located
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function listModels() {
    const API_KEY = process.env.AI_API_KEY;
    if (!API_KEY) {
        console.error('AI_API_KEY not found in .env at ' + path.join(__dirname, '..', '.env'));
        return;
    }
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log('Available models:');
            data.models.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error fetching models:', error);
    }
}

listModels();
