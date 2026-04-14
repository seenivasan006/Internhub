import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';
import { extractTextFromPDF, extractSkillsFromText } from '../services/resumeParser'; // INTERNHUB_AI_MATCHING

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = (req as any).user?._id || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

router.post('/resume', requireAuth, upload.single('resume'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = (req as any).user._id;
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        // INTERNHUB_AI_MATCHING: Auto-extract skills from uploaded resume
        let extractedSkills: string[] = [];
        try {
            const resumeText = await extractTextFromPDF(req.file.path);
            extractedSkills = extractSkillsFromText(resumeText);
            console.log(`📄 Extracted ${extractedSkills.length} skills from resume:`, extractedSkills);
        } catch (parseErr) {
            console.warn('⚠️ Resume skill extraction failed (non-blocking):', parseErr);
        }

        // Merge extracted skills with existing user skills (no duplicates)
        const user = await User.findById(userId);
        const existingSkills = user?.skills || [];
        const existingLower = existingSkills.map(s => s.toLowerCase());
        const newSkills = extractedSkills.filter(s => !existingLower.includes(s.toLowerCase()));
        const mergedSkills = [...existingSkills, ...newSkills];

        await User.findByIdAndUpdate(userId, {
            resumeUrl,
            skills: mergedSkills
        });

        res.json({
            success: true,
            resumeUrl,
            extractedSkills,
            newSkillsAdded: newSkills,
            totalSkills: mergedSkills.length
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to upload resume' });
    }
});

router.delete('/resume', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user._id);
        if (user && user.resumeUrl) {
            const fileName = path.basename(user.resumeUrl);
            const filePath = path.join(uploadDir, fileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            user.resumeUrl = '';
            await user.save();
        }
        res.json({ success: true, message: 'Resume deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

export default router;
