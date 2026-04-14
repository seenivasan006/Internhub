import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  generateCoverLetter,
  generateEssayOutline,
  suggestProfileImprovements,
  generateEssay,
  sendEssayChat
} from '../services/aiService';

const router = Router();

// INTERNHUB_AI_ASSISTANT: Generate a professional cover letter
router.post('/cover-letter', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { opportunityId } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId is required' });
    }

    const coverLetter = await generateCoverLetter(userId, opportunityId);
    res.json({ coverLetter });
  } catch (err: any) {
    console.error('Cover Letter API Error:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Failed to generate cover letter',
        retryAfter: err.retryAfter
    });
  }
});

// INTERNHUB_AI_ASSISTANT: Generate scholarship essay outline
router.post('/essay-outline', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { opportunityId, essayPrompt } = req.body;

    if (!opportunityId || !essayPrompt) {
      return res.status(400).json({ error: 'opportunityId and essayPrompt are required' });
    }

    const outline = await generateEssayOutline(userId, opportunityId, essayPrompt);
    res.json({ outline });
  } catch (err: any) {
    console.error('Essay Outline API Error:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Failed to generate essay outline',
        retryAfter: err.retryAfter
    });
  }
});

// INTERNHUB_AI_ASSISTANT: Get profile improvement suggestions
router.get('/profile-tips', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const tips = await suggestProfileImprovements(userId);
    res.json({ tips });
  } catch (err: any) {
    console.error('Profile Tips API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to get profile tips' });
  }
});

router.post('/generate-essay', requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarshipTitle, careerGoals, achievements, background } = req.body;

    const essayContent = await generateEssay(scholarshipTitle, careerGoals, achievements, background);
    res.json({ essay: essayContent });
  } catch (err: any) {
    console.error('AI Essay Generation Error:', err);
    const errorMessage = err.message || 'AI generation failed without a specific message';
    res.status(err.status || 500).json({ 
        error: errorMessage,
        retryAfter: err.retryAfter,
        details: err.stack
    });
  }
});

router.post('/essay-bot', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { history } = req.body;

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'History array is required' });
    }

    const reply = await sendEssayChat(userId, history);
    res.json({ reply });
  } catch (err: any) {
    console.error('Essay Chatbot API Error:', err);
    res.status(err.status || 500).json({ 
        error: err.message || 'Failed to chat with AI',
        retryAfter: err.retryAfter
    });
  }
});

export default router;
