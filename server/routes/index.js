const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController.js');


//upload 4 images that are send from frontend to the uploads folder
// /api/upload-images
router.post('/upload-images',uploadImages)


module.exports = router;    