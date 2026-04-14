import { User } from '../models/User';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';

// INTERNHUB_AI_ASSISTANT: Service to interact with Google Gemini API directly via native fetch
async function handleGeminiResponse(response: Response, data: any, model: string): Promise<string> {
    if (!response.ok) {
        const errorMessage = data.error?.message || 'Failed to communicate with Gemini';
        const errorStatus = data.error?.status || '';
        
        console.error(`[AI Service] Error from ${model}:`, {
            statusCode: response.status,
            status: errorStatus,
            message: errorMessage
        });

        // Robust check for quota/rate limit errors
        const isQuotaError = response.status === 429 || 
                            errorMessage.toLowerCase().includes('quota') || 
                            errorMessage.toLowerCase().includes('limit') ||
                            errorStatus === 'RESOURCE_EXHAUSTED';

        if (isQuotaError) {
            const error: any = new Error(errorMessage);
            error.status = 429;
            // Parse retry time (e.g. "Please retry in 44.17s" or similar)
            const match = errorMessage.match(/retry in\s+([\d\.]+)\s*s/i);
            if (match) {
                error.retryAfter = Math.ceil(parseFloat(match[1]));
            }
            throw error;
        }
        
        throw new Error(errorMessage);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
}

async function callAI(prompt: string, model: string = 'gemini-flash-latest'): Promise<string> {
    const API_KEY = process.env.AI_API_KEY;
    
    if (!API_KEY) {
        throw new Error('AI_API_KEY is not configured in environment variables');
    }

    // A Gemini API Key is expected here (usually starts with AIza...)
    if (API_KEY.startsWith('sk-')) {
        throw new Error('You are still using an OpenAI key. Please replace AI_API_KEY in .env with a free Gemini API Key.');
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        return await handleGeminiResponse(response, data, model);
    } catch (error) {
        console.error(`Gemini API Error (${model}):`, error);
        throw error;
    }
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

async function callAIChat(history: ChatMessage[], systemInstruction: string = '', model: string = 'gemini-flash-latest'): Promise<string> {
    const API_KEY = process.env.AI_API_KEY;
    if (!API_KEY) throw new Error('AI_API_KEY not configured');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const body: any = { contents };
        if (systemInstruction) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return await handleGeminiResponse(response, data, model);
    } catch (error) {
        console.error(`Gemini Chat Error (${model}):`, error);
        throw error;
    }
}

/**
 * Custom wrapper to handle model fallback and better error reporting
 */
async function callAIWithFallback(prompt: string): Promise<string> {
    try {
        return await callAI(prompt, 'gemini-flash-latest');
    } catch (err: any) {
        if (err.status === 429) {
            console.log('Gemini Flash Latest Quota limit reached, attempting fallback to Gemini 2.0 Flash...');
            try {
                return await callAI(prompt, 'gemini-2.0-flash');
            } catch (fallbackErr: any) {
                throw fallbackErr;
            }
        }
        throw err;
    }
}

async function callAIChatWithFallback(history: ChatMessage[], systemInstruction: string = ''): Promise<string> {
    try {
        return await callAIChat(history, systemInstruction, 'gemini-flash-latest');
    } catch (err: any) {
        if (err.status === 429) {
            console.log('Gemini Flash Latest Chat Quota limit reached, attempting fallback to Gemini 2.0 Flash...');
            try {
                return await callAIChat(history, systemInstruction, 'gemini-2.0-flash');
            } catch (fallbackErr: any) {
                throw fallbackErr;
            }
        }
        throw err;
    }
}

export const generateCoverLetter = async (userId: string, opportunityId: string) => {
    const [user, internship, scholarship] = await Promise.all([
        User.findById(userId),
        Internship.findById(opportunityId),
        Scholarship.findById(opportunityId)
    ]);

    if (!user) throw new Error('User not found');
    const opportunity = internship || scholarship;
    if (!opportunity) throw new Error('Opportunity not found');

    const prompt = `
        You are an AI assistant for InternHub. Write a professional, personalized cover letter for the following student and opportunity.
        
        STUDENT PROFILE:
        Name: ${user.full_name}
        Skills: ${user.skills.join(', ')}
        Education: ${user.education_level} in ${user.field_of_study}
        
        OPPORTUNITY DETAILS:
        Title: ${opportunity.title}
        ${internship ? `Company: ${internship.company}` : `Provider: ${(opportunity as any).provider}`}
        Description: ${opportunity.description}
        
        Keep it concise (max 300 words), professional, and highlight how the student's skills align with the opportunity. Use placeholders like [Your Name] if needed, though most info is provided.
    `;

    return await callAIWithFallback(prompt);
};

export const generateEssayOutline = async (userId: string, opportunityId: string, essayPrompt: string) => {
    const [user, scholarship] = await Promise.all([
        User.findById(userId),
        Scholarship.findById(opportunityId)
    ]);

    if (!user) throw new Error('User not found');
    if (!scholarship) throw new Error('Scholarship not found');

    const prompt = `
        You are an AI assistant for InternHub. Help this student create a structured outline for their scholarship essay.
        
        ESSAY PROMPT: ${essayPrompt}
        
        STUDENT PROFILE:
        Name: ${user.full_name}
        Skills: ${user.skills.join(', ')}
        Education: ${user.education_level} in ${user.field_of_study}
        
        SCHOLARSHIP: ${scholarship.title} by ${scholarship.provider}
        
        Provide a bulleted outline with logical sections: Introduction, Body Paragraphs (highlighting specific experiences), and Conclusion. Focus on answering the prompt effectively.
    `;

    return await callAIWithFallback(prompt);
};

export const suggestProfileImprovements = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Fetch related internships to see what's missing
    const internships = await Internship.find({ status: 'open' }).limit(20);

    const prompt = `
        Analyze this student's profile for InternHub and provide 3-5 concise, actionable tips to improve their chances of getting hired.
        
        STUDENT PROFILE:
        Skills: ${user.skills.join(', ')}
        Education: ${user.education_level} in ${user.field_of_study}
        Location: ${user.location || 'Not specified'}
        
        Consider the current internship market and suggest:
        - Specific high-demand skills they should learn next.
        - Profile sections they should complete (e.g. location, more specific skills).
        - How to better highlight their existing background.
        
        Return the response as a JSON array of strings only. Example: ["Add Python to match 12 more internships", "Specify your location to get local matches"].
    `;

    const rawResponse = await callAIWithFallback(prompt);
    try {
        // Find JSON array in the text in case Gemini wraps it in markdown or text
        const jsonMatch = rawResponse.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(rawResponse);
    } catch (e) {
        console.error('Failed to parse profile tips JSON:', rawResponse);
        return ["Add more relevant skills to your profile", "Keep your resume updated", "Check for new opportunities daily"];
    }
};
export const generateEssay = async (
    scholarshipTitle: string,
    careerGoals: string,
    achievements: string,
    background: string
) => {
    const prompt = `
        You are a professional essay writer for InternHub. Write a compelling and polished Statement of Purpose/Essay for a scholarship application.
        
        DETAILS:
        Scholarship Title: ${scholarshipTitle || 'Scholarship Opportunity'}
        Career Goals: ${careerGoals || 'Professional growth in my field'}
        Personal Background: ${background || 'My journey in my field of study'}
        
        STRUCTURE:
        1. Strong introduction expressing interest and motivation.
        2. Body paragraphs linking the student's background and achievements to the scholarship's goals.
        3. Clear explanation of how this scholarship will help achieve their career goals.
        4. Professional conclusion.
        
        Keep it professional, persuasive, and within 400-600 words. Format with clear paragraphs.
    `;

    return await callAIWithFallback(prompt);
};

export const sendEssayChat = async (userId: string, history: ChatMessage[]) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const systemInstruction = `
        You are an expert AI Essay Consultant for InternHub. Your goal is to help students write outstanding scholarship essays, Statements of Purpose (SoP), and cover letters.
        
        STUDENT CONTEXT:
        Name: ${user.full_name}
        Education: ${user.education_level} in ${user.field_of_study}
        Skills: ${user.skills.join(', ')}
        
        GUIDELINES:
        - Be encouraging, professional, and insightful.
        - Help with brainstorming topics, structuring outlines, and refining drafts.
        - Focus on highlighting the student's unique skills and experiences.
        - If the student asks for a full essay, provide a high-quality draft but encourage them to personalize it.
        - Ensure the tone is appropriate for the scholarship or opportunity they are targeting.
        - Keep responses concise but helpful. Use markdown for formatting.
    `;

    return await callAIChatWithFallback(history, systemInstruction);
};
