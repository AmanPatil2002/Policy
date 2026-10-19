# Policy Project Frontend

## Overview

This is the React frontend for the Policy Forms application. It provides a modern, responsive user interface for policy applications, authentication, and advertisement management.

## Features

### 🚀 Core Functionality
- **Authentication**: Secure login system with role-based access
- **Policy Forms**: Multi-step form with document upload
- **Advertisement Carousel**: Rotating advertisement display
- **Admin Dashboard**: Comprehensive management interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 📱 User Interface
- **Material-UI**: Modern, accessible component library
- **React Router**: Client-side routing
- **Form Validation**: Real-time validation with helpful feedback
- **Responsive Grid System**: Adaptive layout for all screen sizes
- **Accessibility**: WCAG compliant design

## Technology Stack

- **React 19**: Component-based UI framework
- **Vite**: Fast development server and build tool
- **Material-UI**: Component library for consistent design
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **TypeScript**: Type safety for better development experience

## Project Structure

```
src/
├── Pages/              # Route components
│   ├── Login.jsx       # Login page
│   ├── Form.jsx        # Policy application form
│   └── Admin.jsx       # Admin dashboard
│
├── Mycomponent/        # Shared components
│   ├── Advertisement.jsx # Ad management
│   ├── Header.jsx       # Header component
│   ├── Footer.jsx       # Footer component
│   └── Layout.jsx       # Layout component
│
├── utils/              # Utility functions
│   └── ProtectedRoute.jsx # Route protection
│
├── assets/             # Static assets
│   ├── hero.png        # Hero image
│   ├── react.svg       # React logo
│   └── vite.svg        # Vite logo
│
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # CSS styles
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd policy-project/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

### Access the Application

- **Local Development**: `http://localhost:5173`
- **Production**: `https://your-domain.com`

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

### API Configuration

The frontend communicates with the backend API through the following endpoints:

- **Authentication**: `${VITE_API_URL}/auth`
- **Policy Forms**: `${VITE_API_URL}/api/policy`
- **Advertisements**: `${VITE_API_URL}/api/advertisements`
- **Submissions**: `${VITE_API_URL}/api/submissions`

## Development

### Component Architecture

#### Pages
- **Login**: User authentication page
- **Form**: Policy application form with multi-step functionality
- **Admin**: Admin dashboard with management capabilities

#### Shared Components
- **Header**: Navigation bar with responsive design
- **Footer**: Website footer with contact information
- **Layout**: Main application layout with header and footer
- **Advertisement**: Advertisement management interface

#### Utilities
- **ProtectedRoute**: Route protection based on authentication

### Key Features

#### Authentication
- Secure login with email/password
- Role-based redirect (admin/host)
- Local storage of authentication tokens
- Automatic logout on token expiration

#### Policy Form
- Multi-step form with validation
- Document upload with preview
- Client information collection
- Business and nominee details
- File type and size validation

#### Advertisement Management
- Upload new advertisements
- Edit existing advertisements
- Toggle advertisement visibility
- Reorder advertisements
- Delete advertisements

#### Admin Dashboard
- User management
- Advertisement management
- Submission viewing
- Form editing

### Styling

#### Material-UI Theme
The application uses a custom Material-UI theme with the following properties:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: "#2373F4" },
    background: { default: "#F4F6F8", paper: "#FFFFFF" },
    text: { primary: "#0a0a0d", secondary: "#070707" },
    divider: "#E2E6EB",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});
```

#### Responsive Design
The application uses a responsive grid system with the following breakpoints:

- **xs**: Extra small devices (phones)
- **sm**: Small devices (tablets)
- **md**: Medium devices (desktops)
- **lg**: Large devices (large desktops)

### API Integration

#### Authentication
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    const { data } = await axios.post(`${API_URL}/auth/login", {
      email: form.email.trim(),
      password: form.password,
    });
    // Handle successful login
  } catch (err) {
    // Handle error
  }
};
```

#### Policy Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus(null);

  if (!validate()) {
    setStatus({ type: "error", message: "Please fix the highlighted fields." });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const formData = new FormData();
  Object.entries(values).forEach(([key, val]) => formData.append(key, val));
  Object.entries(files).forEach(([key, { file }]) => formData.append(key, file));

  try {
    // const res = await fetch("http://localhost:5000/api/policy", {
    //   method: "POST",
    //   body: formData,
    // });
    // if (!res.ok) throw new Error("Failed");

    console.log([...formData.entries()]);

    handleReset();
    setStatus({ type: "success", message: "Form submitted successfully!" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    setStatus({ type: "error", message: "Submission failed. Try again." });
  }
};
```

#### Advertisement Management
```javascript
const handleUpload = async () => {
  setError("");
  setSuccess("");

  if (items.length === 0) {
    setError("Please choose at least one image");
    return;
  }
  if (items.some((i) => !isValidLink(i.link))) {
    setError("One or more links are not valid http/https URLs");
    return;
  }

  const formData = new FormData();
  items.forEach((i) => formData.append("images", i.file));
  formData.append("links", JSON.stringify(items.map((i) => i.link.trim())));

  try {
    setSubmitting(true);
    const res = await fetch(API_URL, {
      method: "POST",
      headers: authHeader,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    setSuccess("Advertisements uploaded");
    resetForm();
    loadAds();
  } catch (err) {
    setError(err.message);
  } finally {
    setSubmitting(false);
  }
};
```

### Error Handling

#### Client-Side Error Handling
```javascript
const [error, setError] = useState("");

const handleError = (err) => {
  if (err.response?.data?.message) {
    setError(err.response.data.message);
  } else {
    setError("An unexpected error occurred");
  }
};
```

### Performance Optimization

#### Code Splitting
The application uses React's code splitting with Vite to automatically split code based on routes and components.

#### Image Optimization
- Image previews are loaded with proper sizing
- Large images are optimized for web
- Lazy loading is implemented for non-critical images

#### State Management
- Local state management with React hooks
- Global state management for authentication
- Form state management with validation

### Accessibility

#### ARIA Labels
All interactive elements have appropriate ARIA labels and descriptions.

#### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space key activation for buttons
- Escape key for closing modals

#### Screen Reader Support
- Semantic HTML5 elements
- Proper heading hierarchy
- Descriptive alt text for images

### Testing

#### Unit Tests
- Component unit tests
- Hook tests
- Utility function tests

#### Integration Tests
- API integration tests
- Form submission tests
- Authentication tests

#### End-to-End Tests
- User workflow tests
- Navigation tests
- Form submission tests

## Troubleshooting

### Common Issues

#### API Not Found
- Ensure the backend server is running
- Check the `VITE_API_URL` in `.env` file
- Verify network connectivity

#### Build Errors
- Run `npm install` to update dependencies
- Check for syntax errors in code
- Verify TypeScript configuration

#### CSS Issues
- Check for conflicting styles
- Verify Material-UI theme configuration
- Clear browser cache if needed

### Getting Help

1. **Check the documentation**: Review the README files
2. **Browser console**: Check for JavaScript errors
3. **Network tab**: Check for API errors
4. **GitHub Issues**: Submit issues to the project repository

## Development Best Practices

### Component Design
- **Single Responsibility**: Each component has one clear purpose
- **Reusable**: Components are designed for reuse
- **Testable**: Components are easily testable
- **Accessible**: Components support accessibility

### State Management
- **Local State**: Use local state for component-specific data
- **Global State**: Use global state for application-wide data
- **Derived State**: Compute derived state from base state

### API Integration
- **Error Handling**: Implement proper error handling
- **Loading States**: Show loading states during API calls
- **Caching**: Cache frequently used data
- **Retry Logic**: Implement retry logic for failed requests

### Styling
- **Consistency**: Follow Material-UI design patterns
- **Responsiveness**: Ensure responsive design
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Optimize for performance

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
1. **Static Hosting**: Deploy built files to any static hosting service
2. **Server-Side Rendering**: Use with a backend framework
3. **Containerization**: Deploy with Docker
4. **Cloud Services**: Deploy to cloud platforms like Vercel, Netlify, or AWS

### Environment Configuration
```env
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Policy Forms
VITE_APP_VERSION=1.0.0
```

## Support

For support, questions, or feature requests, please refer to the main project documentation or contact the development team.

---

**Note**: This is a development version. For production deployment, ensure proper security measures are in place and conduct thorough testing.