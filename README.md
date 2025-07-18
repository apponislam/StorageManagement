# Storage Management API

🌐 **Live Demo**: [https://storage-management-pi.vercel.app](https://storage-management-pi.vercel.app)

```bash
git clone https://github.com/apponislam/StorageManagement.git
cd StorageManagement
```

## 🛠️ Setup Instructions

### 1. Environment Setup

```bash
cp .env.example .env.local
```

### 2. Install Dependencies

```bash
npm install
```

## ⚙️ Environment Configuration (.env)

Create `.env.local` file with these required parameters:

### Core Application Settings

```bash
NODE_ENV=development # Application environment (development/production)
PORT=5000 # Port to run the server on
```

### Database Configuration

```bash
MONGODB_URL=your_mongodb_connection_string

# Format: mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/dbname?retryWrites=true&w=majority

```

### Security Settings

```bash
BCRYPT_SALT_ROUNDS=12 # Password hashing complexity (recommended: 10-12)

JWT_ACCESS_SECRET=your_jwt_secret # Random string for access tokens
JWT_ACCESS_EXPIRE=1d # Access token validity (1d = 1 day)
JWT_REFRESH_SECRET=your_jwt_secret_2 # Different secret for refresh tokens
JWT_REFRESH_EXPIRE=30d # Refresh token validity (30d = 30 days)
```

### Cloudinary Configuration (For file storage)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Get these from Cloudinary dashboard

```

### Google OAuth Configuration

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000

# Configure at https://console.cloud.google.com/apis/credentials

```

### Email Service (Nodemailer)

```bash
EMAIL_HOST=smtp.gmail.com # SMTP server host
EMAIL_PORT=587 # SMTP port (587 for TLS)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_specific_password # For Gmail, use App Password
EMAIL_FROM=your_email@gmail.com # Sender email address
```

### Uploadcare Configuration (Optional)

```bash
UPLOADCARE_PUBLIC_KEY=your_public_key

# Get from Uploadcare dashboard

```

## 🔒 Security Notice

1. Never commit your `.env` file to version control
2. Add to `.gitignore`:
    ```bash
    .env
    ```
3. For production:

-   Use stronger secrets (min 32 chars)
-   Set `NODE_ENV=production`
-   Use proper SSL certificates

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Build

```bash
npm run build
npm start
```

## 📁 Postman Collection

### Direct Download

[Download Postman Collection](https://github.com/apponislam/StorageManagement/raw/main/Storage%20Management.postman_collection.json)

### Import Instructions

1. Click the link above to download automatically
2. In Postman: Import → Select the downloaded file

## 📚 Complete API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint                       | Description             | Request Body                                                | Headers                             | Requirements          |
| ------ | ------------------------------ | ----------------------- | ----------------------------------------------------------- | ----------------------------------- | --------------------- |
| POST   | `/api/v1/auth/register`        | Register new user       | `file` (image), `data` (JSON: `{username, email, password}` | `Content-Type: multipart/form-data` | -                     |
| GET    | `/api/v1/auth/google`          | Initiate Google OAuth   | -                                                           | -                                   | -                     |
| GET    | `/api/v1/auth/google/callback` | Google OAuth callback   | -                                                           | -                                   | Handled automatically |
| POST   | `/api/v1/auth/login`           | Email login             | `{email, password}`                                         | `Content-Type: application/json`    | -                     |
| DELETE | `/api/v1/auth/delete`          | Delete account          | -                                                           | `Authorization: Bearer <token>`     | Authenticated user    |
| PATCH  | `/api/v1/auth/change-password` | Change password         | `{currentPassword, newPassword}`                            | `Authorization: Bearer <token>`     | Authenticated user    |
| POST   | `/api/v1/auth/forgot-password` | Request password reset  | `{email}`                                                   | -                                   | -                     |
| POST   | `/api/v1/auth/verify-otp`      | Verify OTP              | `{email, otp}`                                              | -                                   | -                     |
| POST   | `/api/v1/auth/resend-otp`      | Resend OTP              | `{email}`                                                   | -                                   | -                     |
| POST   | `/api/v1/auth/reset-password`  | Complete password reset | `{token, newPassword}`                                      | -                                   | -                     |

### 📂 Folder Endpoints

| Method | Endpoint                 | Description          | Request Body           | Headers                         | Requirements       |
| ------ | ------------------------ | -------------------- | ---------------------- | ------------------------------- | ------------------ |
| POST   | `/api/v1/folders`        | Create folder        | `{name, parentId?}`    | `Authorization: Bearer <token>` | Authenticated user |
| GET    | `/api/v1/folders/:id`    | Get folder           | -                      | `Authorization: Bearer <token>` | Authenticated user |
| PATCH  | `/api/v1/folders/:id`    | Update folder        | `{name}`               | `Authorization: Bearer <token>` | Authenticated user |
| DELETE | `/api/v1/folders/:id`    | Delete folder        | -                      | `Authorization: Bearer <token>` | Authenticated user |
| POST   | `/api/v1/folders/secret` | Manage secret folder | `{folderId, password}` | `Authorization: Bearer <token>` | Authenticated user |

### 📁 File Endpoints

| Method | Endpoint                                          | Description     | Request Body                    | Headers                                                             | Requirements                     |
| ------ | ------------------------------------------------- | --------------- | ------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| POST   | `/api/v1/files/upload`                            | Upload file     | `file` (file data), `folderId?` | `Authorization: Bearer <token`, `Content-Type: multipart/form-data` | Authenticated user               |
| GET    | `/api/v1/files/myfiles`                           | List all files  | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| GET    | `/api/v1/files/myfiles/summary`                   | Storage summary | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| GET    | `/api/v1/files/myfiles/summarybytype`             | Files by type   | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| PATCH  | `/api/v1/files/myfiles/:fileId/favorite`          | Toggle favorite | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| GET    | `/api/v1/files/myfiles/favorites`                 | List favorites  | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| PATCH  | `/api/v1/files/myfiles/:fileId/rename`            | Rename file     | `{newName}`                     | `Authorization: Bearer <token>`                                     | Authenticated user               |
| GET    | `/api/v1/files/myfiles/by-date`                   | Files by date   | -                               | `Authorization: Bearer <token>`                                     | Query: `?range=day\|week\|month` |
| POST   | `/api/v1/files/myfiles/:fileId/duplicate`         | Duplicate file  | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |
| POST   | `/api/v1/files/myfiles/:fileId/copy-to/:folderId` | Copy to folder  | -                               | `Authorization: Bearer <token>`                                     | Authenticated user               |

### Key:

-   `?` = Optional parameter
-   `:id` = Path parameter
-   `<token>` = JWT access token

# Storage Management API - Complete Documentation

## 🔐 Authentication Endpoints

### User Registration

```bash
POST /api/v1/auth/register
Content-Type: multipart/form-data
Body: { file: File, data: JSON }
```

### Google OAuth Flow

1. Initiate OAuth:

    ```bash
    GET /api/v1/auth/google
    ```

2. OAuth Callback:
    ```bash
    GET /api/v1/auth/google/callback
    ```

### Email Login

```bash
POST /api/v1/auth/login
Content-Type: application/json
Body: { email: String, password: String }
```

### Account Management

```bash
DELETE /api/v1/auth/delete
Authorization: Bearer <token>
```

### Password Operations

```bash
PATCH /api/v1/auth/change-password
Authorization: Bearer <token>
Body: { currentPassword: String, newPassword: String }

POST /api/v1/auth/forgot-password
Body: { email: String }

POST /api/v1/auth/reset-password
Body: { token: String, newPassword: String }
```

### OTP Verification

```bash
POST /api/v1/auth/verify-otp
Body: { email: String, otp: String }

POST /api/v1/auth/resend-otp
Body: { email: String }
```

## 📂 Folder Endpoints

### Basic Operations

```bash
POST /api/v1/folders
Authorization: Bearer <token>
Body: { name: String, parentId?: String }

GET /api/v1/folders/:id
Authorization: Bearer <token>

PATCH /api/v1/folders/:id
Authorization: Bearer <token>
Body: { name: String }

DELETE /api/v1/folders/:id
Authorization: Bearer <token>
```

### Secret Folders

```bash
POST /api/v1/folders/secret
Authorization: Bearer <token>
Body: { folderId: String, password: String }
```

## 📁 File Endpoints

### File Operations

```bash
POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: { file: File, folderId?: String }

GET /api/v1/files/myfiles
Authorization: Bearer <token>

PATCH /api/v1/files/myfiles/:fileId/favorite
Authorization: Bearer <token>

PATCH /api/v1/files/myfiles/:fileId/rename
Authorization: Bearer <token>
Body: { newName: String }
```

### File Management

```bash
POST /api/v1/files/myfiles/:fileId/duplicate
Authorization: Bearer <token>

POST /api/v1/files/myfiles/:fileId/copy-to/:folderId
Authorization: Bearer <token>
```

### Analytics

```bash
GET /api/v1/files/myfiles/summary
Authorization: Bearer <token>

GET /api/v1/files/myfiles/summarybytype
Authorization: Bearer <token>

GET /api/v1/files/myfiles/by-date
Authorization: Bearer <token>
Query: ?range=day|week|month
```

## ⚠️ Important Notes

1. Never commit `.env` to version control
2. Requires Node.js v18+
