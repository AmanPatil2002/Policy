# Policy Forms Application

## Overview

This is a comprehensive policy management application that handles user authentication, policy form submissions, advertisement management, and role-based access control. The system provides a complete workflow for managing policy applications and their associated data.

## Key Features

### 🚀 Core Functionality
- **User Authentication**: Secure login system with role-based access (admin/host)
- **Policy Management**: Create, submit, and track policy applications
- **Advertisement System**: Upload and manage promotional content
- **Admin Dashboard**: Comprehensive management interface for administrators
- **Real-time Updates**: Live data synchronization across the application

### 📊 Data Management
- **Form Submissions**: Client information collection with document uploads
- **User Roles**: Admin and host user types with different permissions
- **Submission Tracking**: Complete audit trail of all policy submissions
- **File Management**: Secure storage and retrieval of uploaded documents

### 🛡️ Security
- **JWT Authentication**: Token-based secure authentication
- **Role-based Access Control**: Fine-grained permission management
- **Input Validation**: Comprehensive validation of all user inputs
- **Data Integrity**: Database constraints and validation rules

## Technology Stack

### Backend
- **Node.js/Express**: Web framework and API server
- **MySQL**: Relational database for data storage
- **bcrypt**: Password hashing for security
- **jsonwebtoken**: JWT token management
- **CORS**: Cross-origin resource sharing

### Frontend
- **React**: Component-based UI framework
- **Vite**: Fast development server and build tool
- **Material-UI**: Modern, responsive UI components
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

## Architecture

### Folder Structure
```
project-root/
├── backend/                    # Node.js API server
│   ├── Controller/            # Business logic
│   ├── Middleware/            # Express middleware
│   ├── Routes/                # API endpoints
│   ├── config/                # Database configuration
│   └── .env                   # Environment variables
│
└── frontend/                   # React application
    ├── src/                   # Source code
    │   ├── Pages/             # Route components
    │   ├── Mycomponent/       # Shared components
    │   ├── utils/             # Utility functions
    │   └── assets/            # Static assets
    ├── vite.config.js         # Vite configuration
    └── package.json           # Frontend dependencies
```

### Database Schema
The application uses a MySQL database with the following tables:

1. **users**: User accounts with authentication data
2. **form_links**: Policy form access tokens
3. **submissions**: Policy submission records
4. **ad_images**: Advertisement images and metadata

## How to Use

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd policy-forms
   ```

2. **Set up the database**:
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create database and tables
   mysql -u root -p < setup-database.sql
   
   # Alternatively, use your preferred MySQL client
   ```

3. **Install dependencies**:
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**:
   ```bash
   # Edit backend/.env with your database credentials
   # Edit frontend/.env to point to your API server
   ```

5. **Start the application**:
   ```bash
   # Start backend server
   cd ../backend
   npm start
   
   # Start frontend development server
   cd ../frontend
   npm run dev
   ```

### User Workflow

1. **Access the Application**: Navigate to `http://localhost:5173` (or your configured port)
2. **Login**: Use the admin credentials (`admin@example.com` / `admin@123`) to access the admin dashboard
3. **Create a Host**: From the admin panel, create new host users
4. **Submit Policies**: Hosts can submit policy applications through the form
5. **Manage Advertisements**: Upload and manage advertisement images
6. **Track Submissions**: View and filter policy submissions

### Admin Operations

#### User Management
- **View All Users**: See all registered users in the admin panel
- **Create Hosts**: Add new host users with limited permissions
- **Toggle Account Status**: Enable or disable user accounts

#### Advertisement Management
- **Upload Images**: Add new advertisement images
- **Reorder Content**: Arrange ads in desired display order
- **Toggle Visibility**: Show or hide advertisements
- **Delete Images**: Remove unwanted advertisements

#### Submission Management
- **View All Submissions**: See all policy applications
- **Filter and Search**: Find specific submissions using various criteria
- **Export Data**: Generate reports of submission data

#### Form Management
- **Edit Form**: Modify the policy application form fields
- **Update Layout**: Adjust form appearance and structure
- **Manage Fields**: Add or remove form questions

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user information

### User Management (Admin Only)
- `POST /auth/hosts` - Create a new host
- `GET /auth/hosts` - List all hosts
- `PATCH /auth/hosts/:id/status` - Toggle host account status

### Policy Forms
- `POST /api/policy` - Submit a new policy application

### Advertisements (Requires Authentication)
- `GET /api/advertisements` - List all active advertisements
- `POST /api/advertisements` - Upload new advertisement
- `PATCH /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement
- `PATCH /api/advertisements/reorder` - Reorder advertisements

### Submissions (Admin Only)
- `GET /api/submissions` - List all submissions with filtering

## Configuration

### Environment Variables

#### Backend (.env)
- `PORT`: Server port (default: 5000)
- `db_host`: MySQL database host
- `db_user`: MySQL username
- `db_password`: MySQL password
- `db_name`: Database name
- `JWT_SECRET`: JWT token signing secret

#### Frontend (.env)
- `VITE_API_URL`: Base URL for API calls

### Security Considerations

1. **Environment Variables**: Store sensitive data in `.env` files
2. **Password Security**: Passwords are hashed using bcrypt
3. **JWT Tokens**: Short-lived tokens with proper expiration
4. **Input Validation**: All inputs are validated on the server
5. **CORS**: Configured to restrict cross-origin requests

## Development

### Backend Development

#### Adding New Features
1. **Controllers**: Add new functions in the appropriate controller file
2. **Routes**: Define new endpoints in `Routes/` directory
3. **Database**: Add necessary columns or tables to the database
4. **API Documentation**: Update the API documentation

#### Running Tests
```bash
cd backend
npm test
```

### Frontend Development

#### Component Structure
- **Pages**: Complete page components (Login, Form, Admin)
- **Components**: Reusable UI elements (Advertisement, Header, Footer, Layout)
- **Utils**: Utility functions and hooks

#### Styling
- **Material-UI**: Component-based styling system
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation

#### Adding New Features
1. **Pages**: Create new page components in `src/Pages/`
2. **Components**: Add new UI components in `src/Mycomponent/`
3. **Routes**: Update `App.jsx` to include new routes
4. **API Integration**: Update components to use new API endpoints

### Database Migration

For database schema changes:
1. **Backup**: Always backup your database before making changes
2. **Alter Tables**: Use `ALTER TABLE` statements to add/modify columns
3. **Data Migration**: Write scripts for data transformations
4. **Testing**: Thoroughly test the application with the new schema

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Error: Can't connect to MySQL server
# Solution: Ensure MySQL is running and check .env configuration
```

#### CORS Errors
```bash
# Error: Access to XMLHttpRequest at ... from origin ... has been blocked
# Solution: Configure CORS in server.js if needed
```

#### Build Errors
```bash
# Error: Module not found
# Solution: Run 'npm install' in both backend and frontend directories
```

### Getting Help

1. **Check the documentation**: Review the README files
2. **Database logs**: Check MySQL error logs for database issues
3. **Application logs**: Check console output for runtime errors
4. **GitHub Issues**: Submit issues to the project repository

## Best Practices

### Backend
- **Code Organization**: Keep business logic in controllers
- **Security**: Always hash passwords and validate inputs
- **Error Handling**: Implement proper error handling and logging
- **Database**: Use prepared statements to prevent SQL injection
- **Environment Variables**: Never commit environment variables to version control

### Frontend
- **Component Architecture**: Use reusable, composable components
- **State Management**: Implement proper state management
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Implement code splitting and lazy loading
- **Testing**: Write unit and integration tests

### Security
- **Authentication**: Implement proper authentication and authorization
- **Input Validation**: Validate all user inputs
- **HTTPS**: Use HTTPS in production
- **Session Management**: Implement secure session handling
- **Logging**: Log security-relevant events

## License

This project is part of the Policy Forms application. Please refer to the main project license for details.

## Support

For support, questions, or feature requests, please visit the project documentation or contact the development team.

---

**Note**: This is a development version. For production deployment, ensure proper security measures are in place and conduct thorough testing.