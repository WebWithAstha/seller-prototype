const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { geminiBatchProcess } = require('../utils/geminiTrialService');
const { analyzeProductImage } = require('../utils/geminiTextService');

// Directories
const uploadsBaseDir = path.join(__dirname, '..',  'uploads');
const originalDir = path.join(uploadsBaseDir, 'original');
const aiDir = path.join(uploadsBaseDir, 'ai');

// Ensure upload directories exist
[originalDir, aiDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, originalDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { files: 4 }
}).array('images', 4);

// Controller
exports.uploadImages = (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Server error', error: err });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const absolutePaths = req.files.map(file => path.join(originalDir, file.filename));
    console.log(absolutePaths)

    let details ={}
    try {
      await geminiBatchProcess(absolutePaths);
      details = await analyzeProductImage(absolutePaths[0]) || {};  // Analyze the first image
    } catch (error) {
      console.error('Gemini processing error:', error.message);
      return res.status(500).json({ message: 'Gemini processing failed' });
    }

    const responseFiles = req.files.map(file => {
      const original = file.filename;
      const enhanced = file.filename.replace(/(\.[\w]+)$/, '-ai$1');
      return { original, enhanced };
    });

    return res.status(200).json({
      message: 'Images uploaded and processed successfully',
      files: responseFiles,
      details 
    });
  });
};
