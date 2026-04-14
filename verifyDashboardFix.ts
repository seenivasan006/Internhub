const API_URL = 'http://localhost:3000';

async function verifyDashboard() {
    console.log('--- Verifying Dashboard API Fix ---');
    try {
        // Test /api/data/internships
        console.log('Testing /api/data/internships...');
        const intRes = await fetch(`${API_URL}/api/data/internships`);
        console.log(`- Status: ${intRes.status}`);

        // Test /api/data/scholarships
        console.log('\nTesting /api/data/scholarships...');
        const scholRes = await fetch(`${API_URL}/api/data/scholarships`);
        console.log(`- Status: ${scholRes.status}`);

        // Test /api/ai/profile-tips (The previously failing route)
        console.log('\nTesting /api/ai/profile-tips...');
        const tipsRes = await fetch(`${API_URL}/api/ai/profile-tips`);
        console.log(`- Status: ${tipsRes.status}`);

        console.log('\n--- Verification Complete ---');
    } catch (error: any) {
        console.error(`- Error: ${error.message}`);
        console.log('\nNOTE: Tests will fail if the server is not running on localhost:3000.');
    }
}

verifyDashboard();
