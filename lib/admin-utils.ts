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

// User Management API Functions
export async function fetchAllUsers() {
  try {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    
    if (data.success) {
      return { success: true, users: data.users };
    } else {
      return { success: false, error: data.error || 'Failed to fetch users' };
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Error fetching users' };
  }
}

export async function updateUserStatus(userId: string, action: 'suspend' | 'activate' | 'delete') {
  try {
    if (action === 'delete') {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      return data;
    } else {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error(`Error ${action}ing user:`, error);
    return { success: false, error: `Error performing ${action} action` };
  }
} 