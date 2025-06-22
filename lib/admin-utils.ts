export interface AdminUser {
  role: string;
  isAdmin?: boolean;
  sessionId?: string;
  loginTime?: string;
  expiresAt?: string;
}

export interface RegularUser {
  role?: string;
  isAdmin?: boolean;
}

export function checkAdminStatus(): { isAdmin: boolean; user: any } {
  try {
    // First check if there's an admin session
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const admin: AdminUser = JSON.parse(adminData);
      
      // Check if admin session is valid
      if (admin.expiresAt && new Date(admin.expiresAt) < new Date()) {
        // Session expired, clear it
        localStorage.removeItem('admin');
        localStorage.removeItem('user');
        return { isAdmin: false, user: null };
      }
      
      // Valid admin session
      if (admin.role === 'admin' || admin.isAdmin === true) {
        return { isAdmin: true, user: admin };
      }
    }
    
    // Check regular user data (in case admin logged in through regular login)
    const userData = localStorage.getItem('user');
    if (userData) {
      const user: RegularUser = JSON.parse(userData);
      
      // Only return admin status if there's no separate admin session
      // This prevents regular users from having admin privileges
      if (!adminData && (user.role === 'admin' || user.isAdmin === true)) {
        return { isAdmin: true, user };
      }
      
      return { isAdmin: false, user };
    }
    
    return { isAdmin: false, user: null };
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Clear potentially corrupted data
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    return { isAdmin: false, user: null };
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
} 