import { Router } from 'express';
import multer from 'multer';
import { 
  uploadDocument, 
  getDocuments, 
  getDocument, 
  deleteDocument, 
  getStats 
} from '../controllers/documentController';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/markdown',
      'application/json',
      'application/x-yaml',
      'text/yaml',
      'text/plain', // Allow plain text for .md files
    ];
    const allowedExtensions = ['.md', '.markdown', '.json', '.yaml', '.yml'];
    
    const hasValidMime = allowedMimes.includes(file.mimetype);
    const hasValidExt = allowedExtensions.some((ext) =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (hasValidMime || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Markdown (.md) and OpenAPI (.json, .yaml) files are allowed.'));
    }
  },
});

// Routes
router.post('/upload', uploadLimiter, upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/stats', getStats);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;

