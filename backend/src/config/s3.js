const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const fileFilter = (req, file, cb) => {
  // Implement file type restrictions here
  cb(null, true);
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'private',
    metadata: (req, file, cb) => {
      cb(null, {
        'Content-Type': file.mimetype,
        'transaction-id': req.params.transactionId
      });
    },
    key: (req, file, cb) => {
      const fileExtension = file.originalname.split('.').pop();
      const key = `uploads/${uuidv4()}.${fileExtension}`;
      cb(null, key);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

const getSignedUrl = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
};

module.exports = {
  upload,
  getSignedUrl,
  s3
};