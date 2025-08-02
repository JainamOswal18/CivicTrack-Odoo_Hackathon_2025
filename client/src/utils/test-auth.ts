// Utility functions for testing authentication in development

export const testCredentials = {
  validUser: {
    email: 'test@civictrack.com',
    password: 'testpassword123',
    username: 'testuser'
  },
  invalidUser: {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }
};

// Helper function to clear all auth data (useful for testing)
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('✅ Auth data cleared');
};

// Helper function to check current auth status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Current Auth Status:');
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!user);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User info:', userData);
    } catch (e) {
      console.log('❌ Invalid user data in localStorage');
    }
  }
  
  return { hasToken: !!token, hasUser: !!user };
};

// Make functions available globally for development testing
if (typeof window !== 'undefined') {
  (window as any).__authUtils = {
    clearAuthData,
    checkAuthStatus,
    testCredentials
  };
  
  console.log('🚀 Auth testing utilities available at window.__authUtils');
}