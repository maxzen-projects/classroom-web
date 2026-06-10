# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/classroom
# MONGO_URI=mongodb+srv://manikantaswamynittala_db_user:pE351VUZMRGoczA7@cluster0.us3sput.mongodb.net/classweb?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration (for password reset)
# IMPORTANT: For Gmail, use App Password instead of regular password
# 1. Enable 2FA on your Gmail account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Use the 16-character App Password below (not your regular password)
EMAIL_SERVICE=gmail
EMAIL_USER=maninittalanms@gmail.com
EMAIL_PASS=gmkedirlyqgpzdam
EMAIL_FROM=noreply@classroom.com

# File Upload Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Alternative: AWS S3 Configuration (uncomment if using S3 instead of Cloudinary)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your_s3_bucket_name

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES_COUNT=10w