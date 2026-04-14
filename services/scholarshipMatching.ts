export const calculateScholarshipMatch = (user: any, scholarship: any) => {
    let score = 0;

    if (scholarship.community === user.community || scholarship.community === 'All')
        score += 20;

    if (scholarship.state === user.state || scholarship.state === 'All')
        score += 15;

    if (!scholarship.income_limit || user.income <= scholarship.income_limit)
        score += 25;

    if (scholarship.education_level === user.education_level)
        score += 25;

    if (!scholarship.gender || scholarship.gender === 'All' || scholarship.gender === user.gender)
        score += 15;

    return score;
};
