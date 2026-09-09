import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { electionController } from '../controllers/electionController';
import { validateCreateElection, validateAddCandidate } from '../middleware/validate';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth';

const router = Router();

// ── Multer setup for College ID uploads ────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/college-ids');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `college-id-${unique}${ext}`);
  },
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP images and PDF files are allowed.'));
    }
  },
});

// ── Election CRUD ───────────────────────────────────────────────────────────
router.get('/', optionalAuthenticateUser, (req, res, next) => electionController.getElections(req as any, res, next));
router.get('/my-participations', authenticateUser, (req, res, next) => electionController.getMyParticipations(req as any, res, next));
router.get('/:id', (req, res, next) => electionController.getElectionById(req as any, res, next));
router.post('/', authenticateUser, validateCreateElection, (req, res, next) => electionController.createElection(req as any, res, next));
router.patch('/:id/status', authenticateUser, (req, res, next) => electionController.updateElectionStatus(req as any, res, next));

// ── Candidates ─────────────────────────────────────────────────────────────
router.get('/:id/candidates', (req, res, next) => electionController.getCandidates(req as any, res, next));
router.post('/:id/candidates', authenticateUser, validateAddCandidate, (req, res, next) => electionController.addCandidate(req as any, res, next));

// ── Eligibility verification (voter side, before vote) ─────────────────────
router.post('/:id/verify-eligibility', (req, res, next) => electionController.verifyEligibility(req as any, res, next));

// ── Participation (voter participated, NOT who they voted for) ──────────────
router.get('/:id/participations', (req, res, next) => electionController.getParticipations(req as any, res, next));
router.post('/:id/participations', authenticateUser, (req, res, next) => electionController.recordParticipation(req as any, res, next));

// ── Discarded votes ────────────────────────────────────────────────────────
router.get('/:id/discarded-votes', (req, res, next) => electionController.getDiscardedVotes(req as any, res, next));
router.post('/:id/votes/:voteId/discard', authenticateUser, (req, res, next) => electionController.discardVote(req as any, res, next));

// ── College ID upload (university elections) ───────────────────────────────
// Note: The uploaded file path is stored in DB. Files are NOT publicly served.
router.post('/:id/upload-college-id', authenticateUser, upload.single('collegeId'), async (req: any, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const { supabaseService } = await import('../services/supabaseService');
    const record = await supabaseService.createCollegeIdUpload({
      voterId: req.user.id,
      electionId: req.params.id,
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      verificationStatus: 'pending',
      uploadedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        verificationStatus: record.verificationStatus,
        uploadedAt: record.uploadedAt,
        message: 'College ID uploaded. Status: Pending Verification. An administrator will review your document.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
