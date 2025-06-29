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
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Flag,
  Trash2,
  Eye,
  FileText,
  PlayCircle
} from "lucide-react";

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
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
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

  // Fetch comments from API
  useEffect(() => {
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
  }, []);

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject' | 'flag') => {
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, action }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
              : comment
          )
        );
      } else {
        setError(result.error || `Failed to ${action} comment`);
      }
    } catch (err) {
      setError(`Error ${action}ing comment`);
      console.error(`Error ${action}ing comment:`, err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove comment from local state
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      } else {
        setError(result.error || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Error deleting comment');
      console.error('Error deleting comment:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'flagged': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
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
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              onClick={() => router.push('/admin/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Comments Monitoring</h1>
              <p className="text-lg text-muted-foreground">
                Monitor and moderate user comments from notes and video lectures
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                  <p className="text-3xl font-bold text-foreground">{comments.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-foreground">{getCommentsCount('pending')}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-foreground">{getCommentsCount('approved')}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                  <p className="text-3xl font-bold text-foreground">{getCommentsCount('flagged')}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-foreground">{getCommentsCount('rejected')}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'flagged', 'rejected'].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                className="capitalize"
              >
                {status}
                {status !== 'all' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {getCommentsCount(status)}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Comments Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? "No comments match your current filters." 
                    : "No comments have been posted yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComments.map((comment) => (
              <Card key={comment.id} className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-foreground">{comment.user.name}</h4>
                          <Badge variant="outline" className={getStatusColor(comment.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(comment.status)}
                              <span className="capitalize">{comment.status}</span>
                            </div>
                          </Badge>
                          {comment.type && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              {getTypeIcon(comment.type)}
                              <span className="capitalize">{comment.type}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <span><strong>Subject:</strong> {comment.subject}</span>
                          <span><strong>Module:</strong> {comment.module}</span>
                          {comment.year && (
                            <span><strong>Year:</strong> {comment.year}</span>
                          )}
                          {comment.branch && (
                            <span><strong>Branch:</strong> {comment.branch}</span>
                          )}
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {comment.likes !== undefined && (
                            <span className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{comment.likes} likes</span>
                            </span>
                          )}
                          {comment.replies !== undefined && comment.replies > 0 && (
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{comment.replies} replies</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {comment.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleCommentAction(comment.id, 'approve')}
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleCommentAction(comment.id, 'reject')}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          <Button
                            onClick={() => handleCommentAction(comment.id, 'flag')}
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                          
                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button (if needed) */}
        {comments.length >= 100 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg">
              Load More Comments
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
