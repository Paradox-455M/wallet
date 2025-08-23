const multer = require('multer');
const config = require('./env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error('Unsupported file type');
  error.statusCode = 400;
  return cb(error);
};

const uploadMemory = multer({
  storage,
  limits: {
    fileSize: config.maxUploadBytes,
  },
  fileFilter,
});

module.exports = { uploadMemory, fileFilter };