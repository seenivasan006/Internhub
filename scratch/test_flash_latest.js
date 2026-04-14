const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testGeminiFlashLatest() {
    const API_KEY = process.env.AI_API_KEY;
    const model = 'gemini-flash-latest';
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, are you working?" }] }]
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Success! Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.error('Failure:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testGeminiFlashLatest();
