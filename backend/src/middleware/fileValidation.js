const config = require('../config/env');

const MAX_FILE_SIZE_BYTES = config.maxUploadBytes || 100 * 1024 * 1024; // default 100MB
const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));

// Dangerous extensions that should always be blocked
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.vbs', '.js', '.jar', '.pif',
  '.application', '.gadget', '.msc', '.cpl', '.msu', '.vb', '.vbe', '.ws', '.wsf',
  '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2', '.scf',
  '.lnk', '.inf', '.reg', '.dll', '.sh', '.bash',
]);

const ALLOWED_MIME_TYPES = config.allowedMimeTypes || [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'application/zip', 'application/x-zip-compressed',
  'text/plain', 'text/csv', 'application/json',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * Get file extension from filename (lowercase, with dot).
 */
function getExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const last = filename.lastIndexOf('.');
  if (last === -1) return '';
  return filename.slice(last).toLowerCase();
}

/**
 * Middleware that validates file before multer processes it.
 * Attaches validation error to req so multer can be skipped or error returned.
 * Use this before multer when you need to validate field names or count.
 * For single-file upload, multer's fileFilter and limits are the main validation;
 * this middleware adds clear error messages and blocks dangerous extensions.
 */
function validateFileUpload(options = {}) {
  const { maxSize = MAX_FILE_SIZE_BYTES, allowedMime = ALLOWED_MIME_TYPES } = options;

  return (req, res, next) => {
    // Multer will run after this; we can't inspect file here for multipart.
    // So we rely on multer's fileFilter and limits, and ensure error messages are clear.
    req.__fileValidation = { maxSize, allowedMime };
    next();
  };
}

/**
 * After multer, check file and set clear error if invalid.
 * Call this in the upload handler after multer.single() callback.
 */
function checkUploadedFile(file, options = {}) {
  const { maxSize = MAX_FILE_SIZE_BYTES, allowedMime = ALLOWED_MIME_TYPES } = options;

  if (!file || !file.originalname) {
    return { valid: false, error: 'No file provided' };
  }

  const ext = getExtension(file.originalname);
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type not allowed for security reasons (${ext})` };
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File too large. Maximum size is ${maxMB}MB.` };
  }

  if (allowedMime.length > 0 && !allowedMime.includes(file.mimetype)) {
    return { valid: false, error: `File type not allowed. Allowed: ${allowedMime.slice(0, 5).join(', ')}${allowedMime.length > 5 ? '...' : ''}` };
  }

  return { valid: true };
}

module.exports = {
  validateFileUpload,
  checkUploadedFile,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  BLOCKED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  getExtension,
};
