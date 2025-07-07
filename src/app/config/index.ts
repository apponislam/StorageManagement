import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    node_env: process.env.NODE_DEV,
    port: process.env.PORT,
    mongodb_url: process.env.MONGODB_URL,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    // JWT
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expire: process.env.JWT_ACCESS_EXPIRE,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRE,
    // Cloudinary
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    // Google Client
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_callback_url: process.env.GOOGLE_CALLBACK_URL,
    // Nodemailer
    email_host: process.env.EMAIL_HOST,
    email_port: process.env.EMAIL_PORT,
    email_user: process.env.EMAIL_USER,
    email_password: process.env.EMAIL_PASSWORD,
    email_from: process.env.EMAIL_FROM,
    // Redis
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
};
