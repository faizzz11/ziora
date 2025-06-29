'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Users, 
  UserPlus, 
  Search,
  Filter,
  Mail,
  Calendar,
  Eye,
  Ban,
  Edit,
  Trash2,
  Clock,
  AlertTriangle,
  Loader2,
  RotateCcw,
  GraduationCap,
  MapPin,
  User
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  joinDate: string;
  avatar?: string;
  loginCount: number;
  contentViews: number;
  branch?: string;
  year?: string;
  age?: number;
  collegeName?: string;
  username?: string;
}

interface ViewProfileData {
  user: User | null;
  isOpen: boolean;
}

interface EditProfileData {
  user: User | null;
  isOpen: boolean;
  formData: {
    name: string;
    email: string;
    age: string;
    branch: string;
    year: string;
    collegeName: string;
    username: string;
  };
}

interface AddUserData {
  isOpen: boolean;
  formData: {
    name: string;
    email: string;
    password: string;
    age: string;
    branch: string;
    year: string;
    collegeName: string;
    username: string;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  
  // Modal states
  const [viewProfile, setViewProfile] = useState<ViewProfileData>({
    user: null,
    isOpen: false
  });
  
  const [editProfile, setEditProfile] = useState<EditProfileData>({
    user: null,
    isOpen: false,
    formData: {
      name: '',
      email: '',
      age: '',
      branch: '',
      year: '',
      collegeName: '',
      username: ''
    }
  });
  
  const [addUser, setAddUser] = useState<AddUserData>({
    isOpen: false,
    formData: {
      name: '',
      email: '',
      password: '',
      age: '',
      branch: '',
      year: '',
      collegeName: '',
      username: ''
    }
  });

  const branches = [
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Electrical Engineering'
  ];

  const years = ['1', '2', '3', '4'];

  // Verify admin status on component mount
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        // Check for admin session in localStorage (client-side)
        const adminData = localStorage.getItem('admin');
        const userData = localStorage.getItem('user');
        
        if (!adminData && !userData) {
          // No session data, redirect to admin login
          router.push('/admin');
          return;
        }

        // Verify with server by making an API call
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to admin login
            router.push('/admin');
            return;
          }
        }

        // If we get here, admin verification passed
        setIsVerifyingAdmin(false);
      } catch (error) {
        console.error('Admin verification error:', error);
        // On error, redirect to admin login
        router.push('/admin');
      }
    };

    verifyAdminAccess();
  }, [router]);

  // Fetch users from API
  useEffect(() => {
    // Only fetch users if admin verification passed
    if (isVerifyingAdmin) return;
    
    fetchUsers();
  }, [isVerifyingAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      if (action === 'delete') {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } else {
          setError(data.error || 'Failed to delete user');
        }
      } else {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.id === userId
                ? { 
                    ...user, 
                    status: action === 'suspend' ? 'suspended' : 'active'
                  }
                : user
            )
          );
        } else {
          setError(data.error || `Failed to ${action} user`);
        }
      }
    } catch (error) {
      setError(`Error performing ${action} action`);
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const handleViewProfile = (user: User) => {
    setViewProfile({
      user,
      isOpen: true
    });
  };

  const handleEditProfile = (user: User) => {
    setEditProfile({
      user,
      isOpen: true,
      formData: {
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
        branch: user.branch || '',
        year: user.year || '',
        collegeName: user.collegeName || '',
        username: user.username || ''
      }
    });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${editProfile.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'update_profile',
          ...editProfile.formData,
          age: editProfile.formData.age ? parseInt(editProfile.formData.age) : undefined
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update user in local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === editProfile.user?.id
              ? { 
                  ...user, 
                  ...editProfile.formData,
                  age: editProfile.formData.age ? parseInt(editProfile.formData.age) : undefined
                }
              : user
          )
        );
        setEditProfile({ user: null, isOpen: false, formData: {
          name: '', email: '', age: '', branch: '', year: '', collegeName: '', username: ''
        }});
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      setError('Error updating user');
      console.error('Error updating user:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addUser.formData,
          age: addUser.formData.age ? parseInt(addUser.formData.age) : undefined
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add user to local state
        setUsers(prevUsers => [...prevUsers, data.user]);
        setAddUser({ 
          isOpen: false, 
          formData: {
            name: '', email: '', password: '', age: '', branch: '', year: '', collegeName: '', username: ''
          }
        });
      } else {
        setError(data.error || 'Failed to add user');
      }
    } catch (error) {
      setError('Error adding user');
      console.error('Error adding user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Users className="h-3 w-3" />;
      case 'inactive': return <Clock className="h-3 w-3" />;
      case 'suspended': return <Ban className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.branch && user.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getUsersCount = (status: string) => {
    return users.filter(user => user.status === status).length;
  };

  // Show loading state while verifying admin access
  if (isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
                <Button 
                  onClick={() => setError(null)} 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Users Management</h1>
              <p className="text-lg text-muted-foreground">
                Manage user accounts, view profiles, and add new users
              </p>
            </div>
            
            <Dialog open={addUser.isOpen} onOpenChange={(open) => setAddUser(prev => ({ ...prev, isOpen: open }))}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with their details.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Full Name</Label>
                    <Input
                      id="add-name"
                      value={addUser.formData.name}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, name: e.target.value }
                      }))}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-username">Username</Label>
                    <Input
                      id="add-username"
                      value={addUser.formData.username}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, username: e.target.value }
                      }))}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-email">Email</Label>
                    <Input
                      id="add-email"
                      type="email"
                      value={addUser.formData.email}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, email: e.target.value }
                      }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-password">Password</Label>
                    <Input
                      id="add-password"
                      type="password"
                      value={addUser.formData.password}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, password: e.target.value }
                      }))}
                      placeholder="Enter password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-age">Age</Label>
                    <Input
                      id="add-age"
                      type="number"
                      value={addUser.formData.age}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, age: e.target.value }
                      }))}
                      placeholder="Enter age"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="add-year">Study Year</Label>
                    <Select value={addUser.formData.year} onValueChange={(value) => setAddUser(prev => ({
                      ...prev,
                      formData: { ...prev.formData, year: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="add-branch">Branch</Label>
                    <Select value={addUser.formData.branch} onValueChange={(value) => setAddUser(prev => ({
                      ...prev,
                      formData: { ...prev.formData, branch: value }
                    }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="add-college">College Name</Label>
                    <Input
                      id="add-college"
                      value={addUser.formData.collegeName}
                      onChange={(e) => setAddUser(prev => ({
                        ...prev,
                        formData: { ...prev.formData, collegeName: e.target.value }
                      }))}
                      placeholder="Enter college name"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddUser(prev => ({ ...prev, isOpen: false }))}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">{getUsersCount('active')}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                  <p className="text-3xl font-bold text-foreground">{getUsersCount('inactive')}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended Users</p>
                  <p className="text-3xl font-bold text-foreground">{getUsersCount('suspended')}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                <div className="flex space-x-2">
                  {['all', 'active', 'inactive', 'suspended'].map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(status)}
                      className="capitalize"
                    >
                      {status}
                      {status !== 'all' && (
                        <Badge variant="secondary" className="ml-2">
                          {getUsersCount(status)}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardHeader className="border-b border-border p-6">
            <CardTitle className="text-xl font-semibold text-foreground">
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredUsers.map((user, index) => (
                  <div key={user.id} className="p-6 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
                            <Badge className={getStatusColor(user.status)}>
                              {getStatusIcon(user.status)}
                              <span className="ml-1 capitalize">{user.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                            {user.branch && (
                              <div className="flex items-center space-x-1">
                                <GraduationCap className="h-3 w-3" />
                                <span>{user.branch} - Year {user.year}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Logins: {user.loginCount || 0}</span>
                            <span>Content Views: {user.contentViews || 0}</span>
                            <span>Last Active: {user.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleViewProfile(user)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>
                        
                        <Button
                          onClick={() => handleEditProfile(user)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>
                        
                        {user.status === 'suspended' ? (
                          <Button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Activate</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Suspend</span>
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Profile Modal */}
        <Dialog open={viewProfile.isOpen} onOpenChange={(open) => setViewProfile(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>
                View detailed information about this user.
              </DialogDescription>
            </DialogHeader>
            
            {viewProfile.user && (
              <div className="space-y-6 py-4">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={viewProfile.user.avatar} alt={viewProfile.user.name} />
                    <AvatarFallback className="text-xl">
                      {viewProfile.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{viewProfile.user.name}</h2>
                    <Badge className={getStatusColor(viewProfile.user.status)}>
                      {getStatusIcon(viewProfile.user.status)}
                      <span className="ml-1 capitalize">{viewProfile.user.status}</span>
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{viewProfile.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">@{viewProfile.user.username}</span>
                      </div>
                      {viewProfile.user.age && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Age:</span>
                          <span className="text-sm">{viewProfile.user.age} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Academic Information</h3>
                    <div className="space-y-2">
                      {viewProfile.user.branch && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{viewProfile.user.branch}</span>
                        </div>
                      )}
                      {viewProfile.user.year && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Year:</span>
                          <span className="text-sm">{viewProfile.user.year}</span>
                        </div>
                      )}
                      {viewProfile.user.collegeName && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{viewProfile.user.collegeName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Activity Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Logins:</span>
                        <span className="text-sm font-medium">{viewProfile.user.loginCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Content Views:</span>
                        <span className="text-sm font-medium">{viewProfile.user.contentViews || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Join Date:</span>
                        <span className="text-sm font-medium">{new Date(viewProfile.user.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Active:</span>
                        <span className="text-sm font-medium">{viewProfile.user.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewProfile(prev => ({ ...prev, isOpen: false }))}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Modal */}
        <Dialog open={editProfile.isOpen} onOpenChange={(open) => setEditProfile(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
              <DialogDescription>
                Update user information and details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editProfile.formData.name}
                  onChange={(e) => setEditProfile(prev => ({
                    ...prev,
                    formData: { ...prev.formData, name: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editProfile.formData.username}
                  onChange={(e) => setEditProfile(prev => ({
                    ...prev,
                    formData: { ...prev.formData, username: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editProfile.formData.email}
                  onChange={(e) => setEditProfile(prev => ({
                    ...prev,
                    formData: { ...prev.formData, email: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editProfile.formData.age}
                  onChange={(e) => setEditProfile(prev => ({
                    ...prev,
                    formData: { ...prev.formData, age: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-year">Study Year</Label>
                <Select value={editProfile.formData.year} onValueChange={(value) => setEditProfile(prev => ({
                  ...prev,
                  formData: { ...prev.formData, year: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>Year {year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Branch</Label>
                <Select value={editProfile.formData.branch} onValueChange={(value) => setEditProfile(prev => ({
                  ...prev,
                  formData: { ...prev.formData, branch: value }
                }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-college">College Name</Label>
                <Input
                  id="edit-college"
                  value={editProfile.formData.collegeName}
                  onChange={(e) => setEditProfile(prev => ({
                    ...prev,
                    formData: { ...prev.formData, collegeName: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProfile(prev => ({ ...prev, isOpen: false }))}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 