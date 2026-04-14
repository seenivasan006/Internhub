/**
 * InternHub Setup & Requirements
 * 
 * This file lists the necessary software and commands to get the InternHub project 
 * running in your VS Code terminal.
 */

const requirements = {
    software: [
        { name: 'Node.js', version: 'v18 or higher', url: 'https://nodejs.org/' },
        { name: 'MongoDB', version: 'v6 or higher', url: 'https://www.mongodb.com/try/download/community' },
        { name: 'VS Code Extensions', details: 'ESLint, Prettier, Tailwind CSS IntelliSense' }
    ],
    commands: [
        { description: 'Install Dependencies', command: 'npm install' },
        { description: 'Run Development Server (Frontend + Backend)', command: 'npm run dev' },
        { description: 'Run Frontend Only', command: 'npm run dev:frontend' },
        { description: 'Run Backend Only', command: 'npm run dev:backend' },
        { description: 'Seed Database', command: 'npm run seed' }
    ],
    envVars: [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
        'FRONTEND_URL'
    ]
};

function displayRequirements() {
    console.log('=========================================');
    console.log('🚀 InternHub - Project Setup Instructions');
    console.log('=========================================\n');

    console.log('📋 Software Requirements:');
    requirements.software.forEach(sw => {
        console.log(`  - ${sw.name}: ${sw.version || ''} (${sw.url || sw.details})`);
    });

    console.log('\n💻 Required Commands (Run in VS Code terminal):');
    requirements.commands.forEach(cmd => {
        console.log(`  - ${cmd.description}:`);
        console.log(`    > ${cmd.command}`);
    });

    console.log('\n🔐 Required Environment Variables (Check .env):');
    requirements.envVars.forEach(env => {
        console.log(`  - ${env}`);
    });

    console.log('\n💡 Tip: Use "npm install" first to set up everything.');
    console.log('=========================================');
}

// Execute display if run directly
displayRequirements();
