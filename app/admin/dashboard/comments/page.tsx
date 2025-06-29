'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  MessageSquare, 
  AlertTriangle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Flag,
  Trash2,
  Eye,
  FileText,
  PlayCircle,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Comment {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  subject: string;
  module: string;
  timestamp: string;
  status: 'pending' | 'flagged';
  replies?: number;
  likes?: number;
  type?: 'notes' | 'videos';
  contentId?: string;
  year?: string;
  semester?: string;
  branch?: string;
}

export default function CommentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);

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
        const response = await fetch('/api/admin/comments');
        
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

  // Fetch comments from API
  useEffect(() => {
    // Only fetch comments if admin verification passed
    if (isVerifyingAdmin) return;
    
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/comments');
        const result = await response.json();

        if (result.success) {
          setComments(result.comments);
        } else {
          setError(result.error || 'Failed to fetch comments');
        }
      } catch (err) {
        setError('Failed to fetch comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isVerifyingAdmin]);

  const handleFlagComment = async (commentId: string) => {
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, action: 'flag' }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, status: 'flagged' }
              : comment
          )
        );
      } else {
        setError(result.error || 'Failed to flag comment');
      }
    } catch (err) {
      setError('Error flagging comment');
      console.error('Error flagging comment:', err);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId: commentToDelete }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove comment from local state
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentToDelete));
        setDeleteDialogOpen(false);
        setCommentToDelete(null);
      } else {
        setError(result.error || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Error deleting comment');
      console.error('Error deleting comment:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'flagged': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'flagged': return <AlertTriangle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'videos': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'notes': return <FileText className="h-4 w-4 text-green-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesFilter = filter === 'all' || comment.status === filter;
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCommentsCount = (status: string) => {
    return comments.filter(comment => comment.status === status).length;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
                <Button 
                  onClick={() => setError(null)} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comments Management</h1>
              <p className="text-muted-foreground">Review and moderate user comments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
              <p className="text-xs text-muted-foreground">All comments across platform</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCommentsCount('pending')}</div>
              <p className="text-xs text-muted-foreground">Awaiting moderation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCommentsCount('flagged')}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setFilter('all')}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                  >
                    All ({comments.length})
                  </Button>
                  <Button
                    onClick={() => setFilter('pending')}
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Pending ({getCommentsCount('pending')})
                  </Button>
                  <Button
                    onClick={() => setFilter('flagged')}
                    variant={filter === 'flagged' ? 'default' : 'outline'}
                    size="sm"
                  >
                    Flagged ({getCommentsCount('flagged')})
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search comments, users, or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No comments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Comments will appear here as users post them.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <Card key={comment.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                        <AvatarFallback>{comment.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-semibold text-foreground">{comment.user.name}</h4>
                          <Badge className={`text-xs ${getStatusColor(comment.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(comment.status)}
                              <span className="capitalize">{comment.status}</span>
                            </div>
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getTypeIcon(comment.type || 'notes')}
                            <span className="capitalize">{comment.type || 'notes'}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-3">{comment.content}</p>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>{comment.subject}</span>
                          <span className="text-gray-400">•</span>
                          <span>{comment.module}</span>
                          {comment.year && comment.semester && comment.branch && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>{comment.year} {comment.semester} {comment.branch}</span>
                            </>
                          )}
                          <span className="text-gray-400">•</span>
                          <span className="whitespace-nowrap">{comment.timestamp}</span>
                          {comment.replies !== undefined && comment.replies > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="whitespace-nowrap">{comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}</span>
                            </>
                          )}
                          {comment.likes !== undefined && comment.likes > 0 && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="whitespace-nowrap">{comment.likes} {comment.likes === 1 ? 'like' : 'likes'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.status !== 'flagged' && (
                        <Button
                          onClick={() => handleFlagComment(comment.id)}
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      )}
                      <Button
                        onClick={() => openDeleteDialog(comment.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this comment? This action cannot be undone and will permanently remove the comment from the database.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteComment}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Comment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
