# React Router DOM Implementation

This document explains the routing system implemented using React Router DOM for SEO Master Pro.

## 🚀 **Current Routes**

### **Public Routes**
- `/` - Landing Page
- `/signup` - Sign Up Page
- `/dev` - Development Demo Page

### **Protected Routes**
- `/user/dashboard` - User Dashboard (requires user authentication)
- `/admin/dashboard` - Admin Dashboard (requires admin authentication)
- `/dashboard` - Role-based dashboard (accessible by both users and admins)

## 🛡️ **Route Protection Components**

### **ProtectedRoute**
```tsx
<ProtectedRoute requiredRole="user">
  <UserDashboard />
</ProtectedRoute>
```

**Features:**
- Checks if user is authenticated
- Validates specific role requirements
- Redirects to sign-in if not authenticated
- Redirects to appropriate dashboard based on role

### **RoleBasedRoute**
```tsx
<RoleBasedRoute allowedRoles={['user', 'admin']}>
  <UserDashboard />
</RoleBasedRoute>
```

**Features:**
- Allows multiple roles to access the same route
- Flexible role-based access control
- Fallback path configuration

## 🔧 **Navigation**

### **Programmatic Navigation**
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/signup'); // Navigate to sign up
navigate('/user/dashboard'); // Navigate to user dashboard
```

### **Link Navigation**
```tsx
import { Link } from 'react-router-dom';

<Link to="/signup">Sign Up</Link>
<Link to="/user/dashboard">Dashboard</Link>
```

## 🎯 **Future Route Examples**

### **User Routes**
```tsx
<Route path="/user/profile" element={<ProtectedRoute requiredRole="user"><UserProfile /></ProtectedRoute>} />
<Route path="/user/settings" element={<ProtectedRoute requiredRole="user"><UserSettings /></ProtectedRoute>} />
<Route path="/user/seo-tools" element={<ProtectedRoute requiredRole="user"><SEOTools /></ProtectedRoute>} />
```

### **Admin Routes**
```tsx
<Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
<Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />
<Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
```

### **Shared Routes**
```tsx
<Route path="/help" element={<HelpCenter />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/pricing" element={<PricingPage />} />
```

## 🔐 **Authentication Flow**

1. **Unauthenticated User**:
   - Can access public routes (`/`, `/signup`)
   - Redirected to sign-in when accessing protected routes

2. **Authenticated User**:
   - Can access user-specific routes
   - Redirected to appropriate dashboard based on role

3. **Authenticated Admin**:
   - Can access admin-specific routes
   - Can access user routes if needed

## 📁 **File Structure**

```
src/router/
├── AppRouter.tsx          # Main router configuration
├── ProtectedRoute.tsx     # Authentication protection
├── RoleBasedRoute.tsx     # Role-based access control
├── index.ts              # Router exports
└── README.md            # This documentation
```

## 🚀 **Usage Examples**

### **Adding New Protected Route**
```tsx
<Route
  path="/user/seo-analysis"
  element={
    <ProtectedRoute requiredRole="user">
      <SEOAnalysis />
    </ProtectedRoute>
  }
/>
```

### **Adding Role-Based Route**
```tsx
<Route
  path="/reports"
  element={
    <RoleBasedRoute allowedRoles={['user', 'admin']}>
      <Reports />
    </RoleBasedRoute>
  }
/>
```

### **Adding Public Route**
```tsx
<Route path="/about" element={<AboutPage />} />
```

## 🔄 **Route Guards**

The routing system automatically handles:
- **Authentication checks** - Redirects to sign-in if not authenticated
- **Role validation** - Ensures users have the correct role
- **Fallback routing** - Redirects to appropriate pages based on user state
- **URL preservation** - Maintains intended destination after authentication

## 🎨 **Benefits**

- **Type-safe routing** with TypeScript
- **Automatic authentication** handling
- **Role-based access control**
- **Clean URL structure**
- **Browser history support**
- **Easy testing** with route mocking
- **SEO-friendly** URLs
