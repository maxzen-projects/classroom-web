const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads', 'schools');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `school-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG/JPG images allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;