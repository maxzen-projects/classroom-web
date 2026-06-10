const fs = require('fs');
const path = require('path');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_DIR = path.join(__dirname, '..', 'uploads', 'attendance');

const ensureDirectory = async () => {
  await fs.promises.mkdir(IMAGE_DIR, { recursive: true });
};

const parseDataUri = (imageData) => {
  const match = imageData.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/i);

  if (!match) {
    throw new Error('Invalid image format. Only PNG and JPEG images are supported.');
  }

  const mimeType = match[1].toLowerCase();
  const extension = mimeType.includes('png') ? 'png' : 'jpg';
  const base64Payload = match[3];
  const buffer = Buffer.from(base64Payload, 'base64');

  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Attendance image exceeds the maximum allowed size of 5MB.');
  }

  return { buffer, extension };
};

const saveAttendanceImage = async ({ imageData, studentId, sessionId }) => {
  if (!imageData) {
    return null;
  }

  await ensureDirectory();

  const { buffer, extension } = parseDataUri(imageData);
  const fileName = `attendance-${sessionId}-${studentId}-${Date.now()}.${extension}`;
  const filePath = path.join(IMAGE_DIR, fileName);

  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/attendance/${fileName}`;
};

module.exports = {
  saveAttendanceImage,
};
