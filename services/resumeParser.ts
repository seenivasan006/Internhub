// INTERNHUB_AI_MATCHING: Resume skill extraction service
// Extracts skills from uploaded PDF resume text using keyword matching + NLP patterns

import fs from 'fs';
import path from 'path';

// Comprehensive skill database for matching
const SKILL_DATABASE: string[] = [
    // Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'php', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua',
    // Web Frontend
    'react', 'angular', 'vue', 'svelte', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'next.js', 'nuxt', 'gatsby', 'webpack', 'vite',
    // Web Backend
    'node', 'express', 'flask', 'django', 'spring', 'rails', 'fastapi', 'nest.js', 'laravel',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'dynamodb',
    'sqlite', 'cassandra', 'neo4j',
    // AI / ML / Data
    'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'nlp',
    'natural language processing', 'computer vision', 'data science', 'data analysis',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'matplotlib',
    'opencv', 'spacy', 'hugging face', 'langchain',
    // Cloud / DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform',
    'ansible', 'linux', 'git', 'github', 'gitlab',
    // Mobile
    'android', 'ios', 'react native', 'flutter', 'xamarin',
    // Other Technical
    'rest api', 'graphql', 'microservices', 'agile', 'scrum', 'jira',
    'figma', 'photoshop', 'ui/ux', 'blockchain', 'solidity', 'web3',
    'cybersecurity', 'networking', 'embedded systems', 'iot',
    // Soft Skills (relevant for matching)
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'public speaking', 'research', 'writing', 'analytics', 'critical thinking'
];

/**
 * Extract skills from resume text using keyword matching against the skill database.
 * Uses case-insensitive word-boundary matching for accuracy.
 */
export const extractSkillsFromText = (resumeText: string): string[] => {
    if (!resumeText || resumeText.trim().length === 0) return [];

    const textLower = resumeText.toLowerCase();
    const detectedSkills: string[] = [];

    for (const skill of SKILL_DATABASE) {
        // Use word boundary matching to avoid partial matches
        // e.g., "r" should not match inside "research"
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = skill.length <= 2
            ? new RegExp(`\\b${escaped}\\b`, 'i') // Strict boundary for short skills
            : new RegExp(`(?:^|[\\s,;.|()\\-/])${escaped}(?:[\\s,;.|()\\-/]|$)`, 'i');

        if (pattern.test(textLower)) {
            // Capitalize properly for storage
            detectedSkills.push(capitalizeSkill(skill));
        }
    }

    return [...new Set(detectedSkills)]; // Remove duplicates
};

/**
 * Extract text from a PDF file using a lightweight approach.
 * Falls back to empty string if extraction fails.
 */
export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    try {
        // Read raw binary and extract visible text strings
        const buffer = fs.readFileSync(filePath);
        const text = extractTextFromPDFBuffer(buffer);
        return text;
    } catch (err) {
        console.error('PDF text extraction error:', err);
        return '';
    }
};

/**
 * Simple PDF text extraction from buffer.
 * Extracts text between BT/ET blocks and decodes common PDF text operators.
 */
const extractTextFromPDFBuffer = (buffer: Buffer): string => {
    const content = buffer.toString('latin1');
    const textChunks: string[] = [];

    // Strategy 1: Extract text from PDF stream objects
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    let match;

    while ((match = streamRegex.exec(content)) !== null) {
        const streamContent = match[1];
        // Extract text operators: Tj, TJ, '
        const tjRegex = /\(([^)]*)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
            textChunks.push(tjMatch[1]);
        }
    }

    // Strategy 2: Extract any readable ASCII text runs (fallback)
    if (textChunks.length === 0) {
        const readableRegex = /[\x20-\x7E]{4,}/g;
        let readable;
        while ((readable = readableRegex.exec(content)) !== null) {
            const text = readable[0];
            // Filter out PDF syntax artifacts
            if (!text.includes('/') && !text.includes('obj') && !text.includes('endobj')) {
                textChunks.push(text);
            }
        }
    }

    return textChunks.join(' ');
};

const capitalizeSkill = (skill: string): string => {
    // Special cases
    const capitalMap: Record<string, string> = {
        'ai': 'AI', 'nlp': 'NLP', 'sql': 'SQL', 'html': 'HTML', 'css': 'CSS',
        'aws': 'AWS', 'gcp': 'GCP', 'ci/cd': 'CI/CD', 'ui/ux': 'UI/UX',
        'iot': 'IoT', 'c++': 'C++', 'c#': 'C#', 'r': 'R',
        'mysql': 'MySQL', 'postgresql': 'PostgreSQL', 'mongodb': 'MongoDB',
        'graphql': 'GraphQL', 'rest api': 'REST API', 'web3': 'Web3',
        'tensorflow': 'TensorFlow', 'pytorch': 'PyTorch',
        'react native': 'React Native', 'next.js': 'Next.js', 'nest.js': 'Nest.js',
        'scikit-learn': 'Scikit-learn', 'opencv': 'OpenCV',
    };
    if (capitalMap[skill]) return capitalMap[skill];
    return skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
