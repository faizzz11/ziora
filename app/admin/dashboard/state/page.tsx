'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Trash2, RotateCcw, Mail, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface StateUser {
  _id: string;
  email: string;
  status: 'suspended' | 'deleted';
  reason: string;
  suspendedAt?: string;
  deletedAt?: string;
  updatedAt: string;
}

export default function StatePage() {
  const [stateUsers, setStateUsers] = useState<StateUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStateUsers();
  }, []);

  const fetchStateUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/state');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStateUsers(data.users);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching state users:', error);
      setError('Error fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreUserAccess = async (email: string) => {
    try {
      const response = await fetch('/api/admin/state', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Remove user from local state
        setStateUsers(prev => prev.filter(user => user.email !== email));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to restore user access');
      }
    } catch (error) {
      console.error('Error restoring user access:', error);
      setError('Error restoring user access');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User State Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage suspended and deleted users
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Suspended & Deleted Users</span>
              <Badge variant="secondary">{stateUsers.length} total</Badge>
            </CardTitle>
            <CardDescription>
              Users whose accounts have been suspended or deleted by administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stateUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No suspended or deleted users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stateUsers.map((user) => (
                  <Card key={user._id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                            <Badge 
                              variant={user.status === 'suspended' ? 'destructive' : 'secondary'}
                              className={user.status === 'suspended' ? 'bg-orange-100 text-orange-800' : ''}
                            >
                              {user.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {user.reason}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {user.status === 'suspended' && user.suspendedAt && (
                                <span>Suspended: {formatDate(user.suspendedAt)}</span>
                              )}
                              {user.status === 'deleted' && user.deletedAt && (
                                <span>Deleted: {formatDate(user.deletedAt)}</span>
                              )}
                            </div>
                            <div>
                              Updated: {formatDate(user.updatedAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => restoreUserAccess(user.email)}
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore Access
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 