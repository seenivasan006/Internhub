import { TfIdf } from 'natural';

/**
 * Calculates a similarity score between user skills and job requirements.
 * Optimized for performance by using keyword frequency instead of heavy TfIdf loops.
 */
export const calculateAdvancedMatch = (userSkills: string[], jobDescription: string): number => {
    if (!userSkills || userSkills.length === 0 || !jobDescription) return 0;

    const text = jobDescription.toLowerCase();
    // Improved tokenizer to handle C++, .NET, etc.
    const words = text.split(/[\s,./()]+/).filter(w => w.length >= 1);
    const wordCount = words.length;

    if (wordCount === 0) return 0;

    let matchCount = 0;
    userSkills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        if (!s) return;

        // Common synonyms/variations
        const variations = [s];
        if (s === 'react') variations.push('reactjs', 'react.js');
        if (s === 'node') variations.push('nodejs', 'node.js');
        if (s === 'javascript') variations.push('js');
        if (s === 'typescript') variations.push('ts');
        if (s === 'mongodb') variations.push('mongo');
        if (s === 'python') variations.push('django', 'flask'); // Domain related

        const isMatched = variations.some(v => text.includes(v));

        if (isMatched) {
            matchCount += 1;
            // Bonus for multiple occurrences (up to 3) - regex escaped
            const escapedV = s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const occurrences = (text.match(new RegExp(`\\b${escapedV}\\b`, 'g')) || []).length;
            matchCount += Math.min(occurrences * 0.3, 1.0);
        }
    });

    // Normalize: 1.0 match count per user skill is 100%
    const rawScore = (matchCount / (userSkills.length || 1)) * 100;
    // Density boost: more relevant words in a shorter description is better
    const densityBoost = (matchCount / Math.sqrt(wordCount)) * 5;

    return Math.min(Math.round(rawScore + densityBoost), 100);
};

/**
 * INTERNHUB_PHASE2_UPDATE: Weighted Scoring Formula per spec:
 * Match Score = (Skill Match × 50%) + (Location Match × 20%) + (Eligibility Match × 20%) + (Interest Match × 10%)
 */
export const calculateComprehensiveScore = (
    user: any,
    opportunity: any
): number => {
    // 1. Skill Match (50%)
    const userSkills = [...(user.skills || []), ...(user.internshipPreferences?.skills || [])]
        .filter(s => s && typeof s === 'string')
        .map(s => s.toLowerCase());
    const jobSkills = (opportunity.skills_required || [])
        .filter((s: any) => s && typeof s === 'string')
        .map((s: string) => s.toLowerCase());
    const jobText = ((opportunity.title || '') + ' ' + (opportunity.description || '') + ' ' + (opportunity.skills_required || []).join(' ')).toLowerCase();

    // Semantic Score (TF-IDF) - Max 25 points
    const tfidfScore = calculateAdvancedMatch(userSkills, jobText);
    const weightedTfidf = (tfidfScore / 100) * 25;

    // Quantitative Score (Exact Match) - Max 25 points
    let exactMatchScore = 0;
    if (jobSkills.length > 0) {
        const matches = jobSkills.filter((s: string) => userSkills.includes(s));
        exactMatchScore = (matches.length / jobSkills.length) * 25;
    } else if (userSkills.some(s => jobText.includes(s))) {
        // Fallback for missing explicit job skills: search for user skills in text
        exactMatchScore = 15;
    }

    const weightedSkillScore = weightedTfidf + exactMatchScore;

    // 2. Location Match (20%)
    let locationScore = 0;
    const userLoc = user.location?.toLowerCase() || '';
    const userPrefLoc = user.location_preference?.toLowerCase() || '';
    const userState = user.state?.toLowerCase() || '';
    const jobLoc = opportunity.location?.toLowerCase() || '';

    // Extract specific city words for smarter comparison (e.g., "Coimbatore South" -> ["coimbatore", "south"])
    const userLocWords = userLoc.split(/\s+/).filter((w: string) => w.length > 3);
    const prefLocWords = userPrefLoc.split(/\s+/).filter((w: string) => w.length > 3);

    const isRemote = jobLoc.includes('remote');
    const isDirectMatch = (userLoc && jobLoc.includes(userLoc)) || (userPrefLoc && jobLoc.includes(userPrefLoc));
    const isWordMatch = userLocWords.some((w: string) => jobLoc.includes(w)) || prefLocWords.some((w: string) => jobLoc.includes(w));

    if (isRemote) {
        locationScore = 20;
    } else if (isDirectMatch) {
        locationScore = 20;
    } else if (isWordMatch) {
        locationScore = 18; // Very close city/locality match
    } else if (userState && jobLoc.includes(userState)) {
        // State match, but check if we are in different known cities
        // If job is "India" but user is in a state, give medium points
        if (jobLoc === 'india') {
            locationScore = 10; // Broad country match
        } else {
            locationScore = 15; // State match (e.g. Tamil Nadu)
        }
    } else if (jobLoc === 'india') {
        locationScore = 5; // Country match only
    }

    // 3. Eligibility Match (20%) - Degree, CGPA, Year
    let eligibilityScore = 0;
    const oppText = (opportunity.description || '').toLowerCase() + (opportunity.eligibility || '').toLowerCase() + (opportunity.title || '').toLowerCase();

    // Smart Degree Match
    const userDegree = user.degree?.toLowerCase() || '';
    const userEdLevel = user.education_level?.toLowerCase() || '';

    // Check for common degree keywords
    const engineeringKeywords = ['engineering', 'b.e', 'b.tech', 'be', 'btech'];
    const scienceKeywords = ['science', 'b.sc', 'bsc', 'm.sc', 'msc'];

    const isEngUser = engineeringKeywords.some(k => userDegree.includes(k) || userEdLevel.includes('technical'));
    const isEngOpp = engineeringKeywords.some(k => oppText.includes(k));

    if (userDegree && oppText.includes(userDegree)) eligibilityScore += 12;
    else if (isEngUser && isEngOpp) eligibilityScore += 10; // Shared domain match
    else if (userEdLevel && oppText.includes(userEdLevel)) eligibilityScore += 7;

    // CGPA / Marks Match
    if (user.academic_marks && user.academic_marks >= 70) {
        eligibilityScore += 5;
    }

    // Year Match
    if (user.year_of_study) {
        const yearStr = user.year_of_study.toString();
        if (oppText.includes(`${yearStr}st year`) || oppText.includes(`${yearStr}nd year`) ||
            oppText.includes(`${yearStr}rd year`) || oppText.includes(`${yearStr}th year`) ||
            oppText.includes(`year ${yearStr}`)) {
            eligibilityScore += 5;
        }
    }

    // Cap at 20
    eligibilityScore = Math.min(eligibilityScore, 20);

    // 4. Interest Match (10%)
    let interestScore = 0;
    const userInterests = (user.interests || []).map((i: string) => i.toLowerCase());
    const prefCompanyTypes = user.preferred_company_types || [];

    // Check specific interests
    if (userInterests.length > 0) {
        const matches = userInterests.filter((interest: string) =>
            oppText.includes(interest) || (opportunity.title || '').toLowerCase().includes(interest));
        interestScore += (matches.length / userInterests.length) * 5; // Up to 5 points
    } else if (user.field_of_study && oppText.includes(user.field_of_study.toLowerCase())) {
        interestScore += 5;
    }

    // Check preferred company types
    if (prefCompanyTypes.length > 0) {
        if (prefCompanyTypes.includes('Any')) {
            interestScore += 5;
        } else {
            const hasCompanyMatch = prefCompanyTypes.some((type: string) =>
                oppText.includes(type.toLowerCase()) || (opportunity.company || '').toLowerCase().includes(type.toLowerCase())
            );
            if (hasCompanyMatch) interestScore += 5;
        }
    }

    // Cap at 10
    interestScore = Math.min(interestScore, 10);

    // 5. New / Freshness Boost (+5%)
    let freshnessScore = opportunity.is_new ? 5 : 0;

    // Final Normalization: Apply weighted sum
    let totalScore = Math.round(weightedSkillScore + locationScore + eligibilityScore + interestScore + freshnessScore);

    // Variation Logic: Don't let everything cluster at 99%
    // If it's a great match but not perfect, keep it in the 85-95 range
    if (totalScore >= 95 && (weightedSkillScore < 45 || locationScore < 15)) {
        totalScore = 94; // Cap unless skills AND location are top-tier
    }

    // Floor for decent skill match (at least one exact match)
    if (exactMatchScore > 5 && totalScore < 40) {
        totalScore = 40; 
    }

    return Math.min(totalScore, 100);
}

// Kept for backward compatibility if needed, but redirects to comprehensive
export const calculateHybridScore = (
    skillScore: number,
    locationMatch: boolean,
    isNew: boolean
): number => {
    return Math.round((skillScore * 0.5) + (locationMatch ? 30 : 0) + (isNew ? 20 : 0));
};
