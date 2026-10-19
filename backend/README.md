# Policy Project Backend API

## Overview

This is the backend API for a policy management application built with Node.js, Express, and MySQL. The application handles user authentication, policy form submissions, advertisement management, and role-based access control.

## Features

### User Management
- **Authentication**: JWT-based login system with email/password authentication
- **Authorization**: Role-based access control (admin/host)
- **User Management**: Admin can create and manage hosts
- **Account Status**: Support for active/disabled user accounts

### Policy Forms
- **Form Links**: Token-based form access with single-use options
- **Submissions**: Client data collection with file upload support
- **Validation**: Comprehensive form validation and data integrity checks
- **Tracking**: Submission history with IP and user agent tracking

### Advertisement Management
- **Image Upload**: File upload for advertisements
- **Management**: CRUD operations for ads
- **Ordering**: Sort order management for display
- **Activation**: Toggle ad visibility

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### User Management (Admin Only)
- `POST /auth/hosts` - Create a new host
- `GET /auth/hosts` - List all hosts
- `PATCH /auth/hosts/:id/status` - Toggle host status

### Policy Forms
- `POST /api/policy` - Submit a new policy form

### Advertisements (Requires Authentication)
- `GET /api/advertisements` - List all active advertisements
- `POST /api/advertisements` - Upload new advertisements
- `PATCH /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement
- `PATCH /api/advertisements/reorder` - Reorder advertisements

### Submissions (Admin Only)
- `GET /api/submissions` - List all submissions

## Database Schema

### Users
- `id`: Unique identifier
- `email`: Unique email address
- `password_hash`: Hashed password
- `role`: User role (admin/host)
- `is_active`: Account status
- `created_at`/`updated_at`: Timestamp tracking

### Form Links
- `id`: Unique identifier
- `token`: Form access token
- `created_by`: Form owner
- `client_label`: Client identifier
- `status`: Form status (active/used/disabled)
- `single_use`: Single use flag
- `expires_at`: Expiration date
- `used_at`: Usage timestamp

### Submissions
- `id`: Unique identifier
- `form_link_id`: Associated form link
- `owner_id`: Form owner
- `client_name`/`client_email`/`client_phone`: Client information
- `data`: Submitted form data (JSON)
- `ip_address`/`user_agent`: Request metadata
- `submitted_at`: Submission timestamp

### Ad Images
- `id`: Unique identifier
- `uploaded_by`: Uploader
- `file_path`: Storage path
- `original_name`: Original filename
- `link_url`: Target URL
- `is_active`: Visibility status
- `sort_order`: Display order

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `db_host`: Database host
- `db_user`: Database username
- `db_password`: Database password
- `db_name`: Database name
- `JWT_SECRET`: JWT token signing secret

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL database
- npm or yarn

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create the MySQL database and import the schema:
   ```bash
   mysql -u root -p < setup-database.sql
   ```

### Running
1. Start the server:
   ```bash
   npm start
   ```

### Authentication
1. The default admin user is created on first run:
   - Email: `admin@example.com`
   - Password: `admin@123`

## Project Structure

```
backend/
├── Controller/          # Business logic
│   ├── authController.js # Authentication logic
│   ├── formController.js  # Form submission logic
│   └── advController.js   # Advertisement logic
│
├── Middleware/          # Express middleware
│   └── authenticate.js  # JWT authentication
│
├── Routes/              # API routes
│   ├── authRoute.js     # Authentication routes
│   ├── formRoute.js     # Form submission routes
│   └── advRoute.js      # Advertisement routes
│
├── config/              # Configuration
│   └── db.js           # Database connection
│
├── .env                # Environment variables
├── package.json        # Dependencies
└── server.js           # Express server
```

## Security Notes

1. **Passwords**: Stored as bcrypt hashes
2. **Tokens**: JWT tokens with expiration
3. **Validation**: Comprehensive input validation
4. **Authentication**: JWT middleware for protected routes
5. **Environment**: Sensitive data in environment variables

## Development

### Running
- Use `npm start` for production
- Use `npm run dev` (with nodemon) for development

### Database Migration
For database schema changes, always backup first and use appropriate ALTER statements.

## License

This project is part of the Policy Forms application.

## Contact

For questions or issues, please refer to the main project documentation.