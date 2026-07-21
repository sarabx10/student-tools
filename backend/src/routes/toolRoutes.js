// ============================================================
//  Tool routes (Phase 3 & 4)
// ------------------------------------------------------------
//  These are wired-up STUBS so the API is complete and testable
//  today. Each returns 501 Not Implemented with a note. Fill in
//  the controllers module-by-module as you build each tool.
// ============================================================
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { createParaphrase, getParaphraseHistory } from '../controllers/paraphraseController.js';
import { checkWritingHandler } from '../controllers/writingCheckController.js';
import { createSummary, getSummaries } from '../controllers/summarizeController.js';
import { createCitation, getCitations } from '../controllers/citationController.js';
import {
  createStudyPlan,
  getStudyPlans,
  updateStudyPlan,
  deleteStudyPlan,
} from '../controllers/studyPlanController.js';
import { humanizeHandler, checkHandler } from '../controllers/humanizeController.js';
import { createResearch, getResearchHistory } from '../controllers/researchController.js';
import { tutorHandler } from '../controllers/tutorController.js';

const router = Router();

// All tool routes require a logged-in user.
router.use(requireAuth);

const todo = (name) => (req, res) =>
  res.status(501).json({ message: `${name} not implemented yet (Phase 3/4).` });

// --- Writing Improvement / Paraphrasing ---
router.post('/paraphrase', createParaphrase);
router.get('/paraphrase/history', getParaphraseHistory);

// --- Summarizer ---
router.post('/summarize', upload.single('file'), createSummary);
router.get('/summaries', getSummaries);

// --- Writing / Grammar Checker (find & fix mistakes) ---
router.post('/writing-check', checkWritingHandler);

// --- Humanizer (rewrite to read more naturally) ---
router.post('/humanize', humanizeHandler);
router.post('/humanize/check', checkHandler);

// --- Research Assistant ---
router.post('/research', createResearch);
router.get('/research/history', getResearchHistory);

// --- AI Tutor (conversational teaching) ---
router.post('/tutor', tutorHandler);

// --- Similarity Checker (plagiarism-style, Phase 4) ---
router.post('/similarity', upload.single('file'), todo('Similarity check'));
router.get('/similarity/reports', todo('Similarity reports'));

// --- Citation Generator ---
router.post('/citations', createCitation);
router.get('/citations', getCitations);

// --- Study Planner ---
router.post('/study-plans', createStudyPlan);
router.get('/study-plans', getStudyPlans);
router.patch('/study-plans/:id', updateStudyPlan);
router.delete('/study-plans/:id', deleteStudyPlan);

// --- Progress (computed) ---
router.get('/progress', todo('Progress summary'));

export default router;
