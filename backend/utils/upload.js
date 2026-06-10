const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type');
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('file');

module.exports = upload;