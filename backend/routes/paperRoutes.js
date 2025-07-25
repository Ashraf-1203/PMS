const express = require('express');
const router = express.Router();
const {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  deckleMatch,
  importPapers,
} = require('../controllers/papersController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// All routes here are protected by default and will check for a valid token
router.use(protect);

// Route for importing papers from Excel
router.post('/import', [checkPermission('addPaperMaster', 'add'), upload.single('file')], importPapers);

// Route for getting all papers and creating a new paper
router.route('/')
  .get(checkPermission('papersMasterList', 'view'), getPapers)
  .post(checkPermission('papersMasterList', 'add'), createPaper);

// Route for getting, updating, and deleting a single paper by ID
router.route('/:id')
  .get(checkPermission('papersMasterList', 'view'), getPaperById)
  .put(checkPermission('papersMasterList', 'edit'), updatePaper)
  .delete(checkPermission('papersMasterList', 'delete'), deletePaper);

// Route for Deckle Match
router.post('/deckle-match', checkPermission('deckleMatch', 'add'), deckleMatch);

module.exports = router;
