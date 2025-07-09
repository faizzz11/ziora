'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  userId?: string;
  replies: Comment[];
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

interface Topic {
  id: string;
  title: string;
  videoUrl: string;
  notes: string;
  comments: Comment[];
}

interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics: string[];
  materials: string;
  color: string;
}

interface SubjectVideos {
  modules: Module[];
}

interface VideoLecturesClientProps {
  subject: Subject;
  subjectVideos: SubjectVideos;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

interface PlaylistImportData {
  playlistTitle: string;
  videos: {
    id: string;
    title: string;
    videoUrl: string;
    duration?: string;
  }[];
}

// Recursive Comment Component for Video Lectures
const CommentComponent: React.FC<{ 
  comment: Comment; 
  depth?: number;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onReplySubmit: (e: React.FormEvent, parentCommentId: string) => void;
  onToggleReply: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
  isAdmin: boolean;
}> = React.memo(({ 
  comment, 
  depth = 0, 
  onReply, 
  replyingTo, 
  replyContent, 
  setReplyContent, 
  onReplySubmit, 
  onToggleReply,
  onLikeComment,
  onDislikeComment,
  onDeleteComment,
  currentUserId,
  isAdmin
}) => {
  const maxDepth = 10; // Limit nesting depth
  const canReply = depth < maxDepth;
  
  // State for collapsing/expanding replies - Default to FALSE (hidden)
  const [isRepliesExpanded, setIsRepliesExpanded] = React.useState(false);
  
  const toggleRepliesExpansion = () => {
    setIsRepliesExpanded(!isRepliesExpanded);
  };

  // Check if current user has liked/disliked this comment
  const hasLiked = currentUserId ? comment.likedBy.includes(currentUserId) : false;
  const hasDisliked = currentUserId ? comment.dislikedBy.includes(currentUserId) : false;
  
  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="flex items-start space-x-3 p-4 bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-lg">
        <div className="w-8 h-8 bg-muted dark:bg-[oklch(0.225_0_0)] rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground">
            {comment.author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-foreground">{comment.author}</span>
            <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
            {/* Admin Delete Button */}
            {isAdmin && (
              <button 
                onClick={() => onDeleteComment(comment.id)}
                className="ml-auto text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                title="Delete comment (Admin only)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-muted-foreground mb-2">{comment.content}</p>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            {/* Like/Dislike buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onLikeComment(comment.id)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  hasLiked 
                    ? 'text-blue-600 hover:text-blue-700' 
                    : 'text-muted-foreground hover:text-blue-600'
                }`}
              >
                <svg className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 8v12m-6-6h2m4 0h2" />
                </svg>
                <span>{comment.likes}</span>
              </button>
              
              <button 
                onClick={() => onDislikeComment(comment.id)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  hasDisliked 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-muted-foreground hover:text-red-600'
                }`}
              >
                <svg className="w-4 h-4" fill={hasDisliked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905.905 0 .714.211 1.412.608 2.006L15 16V4M9 10h2m4 0h2" />
                </svg>
                <span>{comment.dislikes}</span>
              </button>
            </div>

            {canReply && (
              <button 
                onClick={() => onToggleReply(comment.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reply
              </button>
            )}
            
            {/* Replies toggle button */}
            {comment.replies.length > 0 && (
              <button 
                onClick={toggleRepliesExpansion}
                className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isRepliesExpanded ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>
                  {isRepliesExpanded ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </button>
            )}
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
                autoFocus
              />
              <div className="flex items-center space-x-2 mt-2">
                <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  Post Reply
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => onToggleReply(comment.id)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Nested Replies - Collapsible */}
      {comment.replies.length > 0 && isRepliesExpanded && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentComponent 
              key={reply.id} 
              comment={reply} 
              depth={depth + 1}
              onReply={onReply}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReplySubmit={onReplySubmit}
              onToggleReply={onToggleReply}
              onLikeComment={onLikeComment}
              onDislikeComment={onDislikeComment}
              onDeleteComment={onDeleteComment}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
});

CommentComponent.displayName = 'VideoCommentComponent';

// Function to convert youtu.be URL to embed format
const convertToEmbedUrl = (url: string): string => {
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return url;
};

// API helper functions
const saveVideosToAPI = async (year: string, semester: string, branch: string, subjectName: string, videos: SubjectVideos) => {
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'video-lecs',
        content: videos,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save videos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving videos:', error);
    throw error;
  }
};

const updateVideoInAPI = async (year: string, semester: string, branch: string, subjectName: string, updatedVideos: SubjectVideos) => {
  try {
    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'video-lecs',
        content: updatedVideos,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update video');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

const deleteVideoFromAPI = async (year: string, semester: string, branch: string, subjectName: string, updatedVideos: SubjectVideos) => {
  try {
    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'video-lecs',
        content: updatedVideos,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete video');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

export default function VideoLecturesClient({ subject, subjectVideos, subjectName, year, semester, branch }: VideoLecturesClientProps) {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [modules, setModules] = useState<Module[]>(subjectVideos.modules);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editModuleName, setEditModuleName] = useState('');
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editVideoData, setEditVideoData] = useState({
    title: '',
    videoUrl: '',
    notes: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'module' | 'video' | null;
    id: string;
    moduleId?: string;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    moduleId: '',
    title: ''
  });

  // Playlist Import States
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistPreview, setPlaylistPreview] = useState<PlaylistImportData | null>(null);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Comment state management
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; id: string } | null>(null);
  
  useEffect(() => {
    // Check for admin status from localStorage
    const adminData = localStorage.getItem('admin');
    const userData = localStorage.getItem('user');
    
    if (adminData) {
      const admin = JSON.parse(adminData);
      setIsAdmin(admin.role === 'admin' || admin.isAdmin === true);
      setCurrentUser({ name: 'Admin User', id: 'admin' });
    } else if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
      setCurrentUser({ name: user.name || 'Anonymous User', id: user.id || 'anonymous' });
    } else {
      setCurrentUser({ name: 'Anonymous User', id: 'anonymous' });
    }
  }, []);

  useEffect(() => {
    if (modules?.length > 0) {
      // Ensure all topics have comments array and comments have like/dislike properties
      const modulesWithComments = modules.map(module => ({
        ...module,
        topics: module.topics.map(topic => ({
          ...topic,
          comments: (topic.comments || []).map(comment => ({
            ...comment,
            likes: comment.likes || 0,
            dislikes: comment.dislikes || 0,
            likedBy: comment.likedBy || [],
            dislikedBy: comment.dislikedBy || [],
            replies: (comment.replies || []).map(reply => ({
              ...reply,
              likes: reply.likes || 0,
              dislikes: reply.dislikes || 0,
              likedBy: reply.likedBy || [],
              dislikedBy: reply.dislikedBy || []
            }))
          }))
        }))
      }));
      setModules(modulesWithComments);
      
      const firstModule = modulesWithComments[0];
      setSelectedModule(firstModule.id);
      if (firstModule.topics?.length > 0) {
        setCurrentTopic(firstModule.topics[0]);
      }
    }
  }, []);

  const allTopics = modules.flatMap(module => module.topics);
  const currentIndex = allTopics.findIndex(topic => topic.id === currentTopic?.id);
  const previousTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const handleTopicChange = (topic: Topic) => {
    setCurrentTopic(topic);
  };

  const handlePreviousTopic = () => {
    if (previousTopic) {
      setCurrentTopic(previousTopic);
    }
  };

  const handleNextTopic = () => {
    if (nextTopic) {
      setCurrentTopic(nextTopic);
    }
  };

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTopic || !newComment.trim()) return;

    try {
      // Find the module that contains the current topic
      const currentModule = modules.find(module => 
        module.topics.some(topic => topic.id === currentTopic.id)
      );

      // Save comment to MongoDB first
      const response = await fetch('/api/content/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: currentUser?.name || 'Anonymous User',
          content: newComment.trim(),
          subject: subject.name,
          module: currentModule?.name || 'Unknown Module',
          type: 'videos',
          contentId: currentTopic.id,
          year,
          semester,
          branch,
          userId: currentUser?.id,
          userEmail: `${currentUser?.name || 'Anonymous'}@ziora.com`
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Create local comment object with MongoDB ID
        const newCommentObj: Comment = {
          id: result.comment.id,
          author: result.comment.author,
          content: result.comment.content,
          timestamp: result.comment.timestamp,
          userId: result.comment.userId,
          replies: [],
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: []
        };

        // Update local state
        const updatedModules = modules.map(module => ({
          ...module,
          topics: module.topics.map(topic => {
            if (topic.id === currentTopic.id) {
              return { ...topic, comments: [...topic.comments, newCommentObj] };
            }
            return topic;
          })
        }));

        setModules(updatedModules);
        setCurrentTopic(prev => prev ? { ...prev, comments: [...prev.comments, newCommentObj] } : prev);
      setNewComment('');

        // Also save to the existing video API for backward compatibility
        updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules })
          .catch(error => {
            console.error('Error updating video API:', error);
          });
      } else {
        console.error('Error saving comment to MongoDB:', result.error);
        alert('Failed to save comment. Please try again.');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment. Please try again.');
    }
  }, [currentTopic, newComment, currentUser, modules, year, semester, branch, subjectName, subject.name]);

  const handleReplySubmit = useCallback((e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!currentTopic || !replyContent.trim()) return;

    const newReplyObj: Comment = {
      id: `comment-${Date.now()}`,
      author: currentUser?.name || 'Anonymous User',
      content: replyContent.trim(),
      timestamp: new Date().toLocaleString(),
      userId: currentUser?.id,
      replies: [],
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: []
    };

    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [...comment.replies, newReplyObj] };
        } else if (comment.replies.length > 0) {
          return { ...comment, replies: addReplyToComment(comment.replies) };
        }
        return comment;
      });
    };

    const updatedModules = modules.map(module => ({
      ...module,
      topics: module.topics.map(topic => {
        if (topic.id === currentTopic.id) {
          return { ...topic, comments: addReplyToComment(topic.comments) };
        }
        return topic;
      })
    }));

    setModules(updatedModules);
    setCurrentTopic(prev => prev ? { ...prev, comments: addReplyToComment(prev.comments) } : prev);
    setReplyContent('');
    setReplyingTo(null);

    // Save to API
    updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules })
      .catch(error => {
        console.error('Error saving reply:', error);
        // Revert changes on error
        setModules(modules);
      });
  }, [currentTopic, replyContent, currentUser, modules, year, semester, branch, subjectName]);

  const toggleReply = useCallback((commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
  }, [replyingTo]);

  // Like/Dislike handlers for video comments
  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!currentTopic || !currentUser?.id) return;

    const updateCommentLikes = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const hasLiked = comment.likedBy.includes(currentUser.id);
          const hasDisliked = comment.dislikedBy.includes(currentUser.id);
          
          if (hasLiked) {
            // Remove like
            return {
              ...comment,
              likes: comment.likes - 1,
              likedBy: comment.likedBy.filter(id => id !== currentUser.id)
            };
          } else {
            // Add like and remove dislike if exists
            return {
              ...comment,
              likes: comment.likes + 1,
              dislikes: hasDisliked ? comment.dislikes - 1 : comment.dislikes,
              likedBy: [...comment.likedBy, currentUser.id],
              dislikedBy: hasDisliked ? comment.dislikedBy.filter(id => id !== currentUser.id) : comment.dislikedBy
            };
          }
        } else if (comment.replies.length > 0) {
          return { ...comment, replies: updateCommentLikes(comment.replies) };
        }
        return comment;
      });
    };

    const updatedModules = modules.map(module => ({
      ...module,
      topics: module.topics.map(topic => {
        if (topic.id === currentTopic.id) {
          return { ...topic, comments: updateCommentLikes(topic.comments) };
        }
        return topic;
      })
    }));

    try {
      setModules(updatedModules);
      setCurrentTopic(prev => prev ? { ...prev, comments: updateCommentLikes(prev.comments) } : prev);
      
      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert changes on error
      setModules(modules);
    }
  }, [currentTopic, currentUser, modules, year, semester, branch, subjectName]);

  const handleDislikeComment = useCallback(async (commentId: string) => {
    if (!currentTopic || !currentUser?.id) return;

    const updateCommentDislikes = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const hasLiked = comment.likedBy.includes(currentUser.id);
          const hasDisliked = comment.dislikedBy.includes(currentUser.id);
          
          if (hasDisliked) {
            // Remove dislike
            return {
              ...comment,
              dislikes: comment.dislikes - 1,
              dislikedBy: comment.dislikedBy.filter(id => id !== currentUser.id)
            };
          } else {
            // Add dislike and remove like if exists
            return {
              ...comment,
              likes: hasLiked ? comment.likes - 1 : comment.likes,
              dislikes: comment.dislikes + 1,
              likedBy: hasLiked ? comment.likedBy.filter(id => id !== currentUser.id) : comment.likedBy,
              dislikedBy: [...comment.dislikedBy, currentUser.id]
            };
          }
        } else if (comment.replies.length > 0) {
          return { ...comment, replies: updateCommentDislikes(comment.replies) };
        }
        return comment;
      });
    };

    const updatedModules = modules.map(module => ({
      ...module,
      topics: module.topics.map(topic => {
        if (topic.id === currentTopic.id) {
          return { ...topic, comments: updateCommentDislikes(topic.comments) };
        }
        return topic;
      })
    }));

    try {
      setModules(updatedModules);
      setCurrentTopic(prev => prev ? { ...prev, comments: updateCommentDislikes(prev.comments) } : prev);
      
      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
    } catch (error) {
      console.error('Error updating dislike:', error);
      // Revert changes on error
      setModules(modules);
    }
  }, [currentTopic, currentUser, modules, year, semester, branch, subjectName]);

  // Delete comment handler (Admin only)
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!currentTopic || !isAdmin) return;

    const deleteCommentFromArray = (comments: Comment[]): Comment[] => {
      return comments.reduce((acc: Comment[], comment) => {
        if (comment.id === commentId) {
          // Skip this comment (delete it)
          return acc;
        } else if (comment.replies.length > 0) {
          // Recursively delete from replies
          return [...acc, { ...comment, replies: deleteCommentFromArray(comment.replies) }];
        } else {
          // Keep this comment
          return [...acc, comment];
        }
      }, []);
    };

    const updatedModules = modules.map(module => ({
      ...module,
      topics: module.topics.map(topic => {
        if (topic.id === currentTopic.id) {
          return { ...topic, comments: deleteCommentFromArray(topic.comments) };
        }
        return topic;
      })
    }));

    try {
      setModules(updatedModules);
      setCurrentTopic(prev => prev ? { ...prev, comments: deleteCommentFromArray(prev.comments) } : prev);
      
      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Comment deleted successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Revert changes on error
      setModules(modules);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to delete comment!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  }, [currentTopic, isAdmin, modules, year, semester, branch, subjectName]);

  const handleAddModule = async () => {
    const newModuleId = `module-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      name: `New Module ${modules.length + 1}`,
      topics: []
    };

    try {
      // Update local state first
      const updatedModules = [...modules, newModule];
      setModules(updatedModules);

      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Module added successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to add module:', error);
      // Revert changes on error
      setModules(modules);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to add module!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  };

  const handleAddVideo = async (moduleId: string) => {
    const newVideoId = `topic-${Date.now()}`;
    const newVideo: Topic = {
      id: newVideoId,
      title: 'New Video Topic',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: 'Add description for this video topic',
      comments: []
    };

    try {
      // Update local state first
      const updatedModules = modules.map(module => 
        module.id === moduleId 
          ? { ...module, topics: [...module.topics, newVideo] }
          : module
      );
      setModules(updatedModules);

      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Start editing the new video
      setEditingVideo(newVideoId);
      setEditVideoData({
        title: newVideo.title,
        videoUrl: newVideo.videoUrl,
        notes: newVideo.notes
      });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Video added successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to add video:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to add video!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  };

  const handleEditModule = (moduleId: string, currentName: string) => {
    setEditingModule(moduleId);
    setEditModuleName(currentName);
  };

  const handleSaveModuleName = async (moduleId: string) => {
    if (editModuleName.trim()) {
      try {
        // Update local state first
        const updatedModules = modules.map(module => 
        module.id === moduleId 
          ? { ...module, name: editModuleName.trim() }
          : module
        );
        setModules(updatedModules);

        // Save to API
        await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Module name updated successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to update module name:', error);
        // Revert changes on error
        setModules(modules);
        
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to update module name!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }
    }
    setEditingModule(null);
    setEditModuleName('');
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setEditModuleName('');
  };

  const handleDeleteModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    setDeleteModal({
      isOpen: true,
      type: 'module',
      id: moduleId,
      title: module?.name || 'Module'
    });
  };

  const confirmDeleteModule = async (moduleId: string) => {
    try {
      // Update local state first
      const updatedModules = modules.filter(module => module.id !== moduleId);
      setModules(updatedModules);
    
    // If we're deleting the currently selected module, clear selection
    if (selectedModule === moduleId) {
      setSelectedModule('');
      setCurrentTopic(null);
    }
    
    // If the current topic belongs to the deleted module, clear it
    if (currentTopic && modules.find(m => m.id === moduleId)?.topics.some(t => t.id === currentTopic.id)) {
      setCurrentTopic(null);
      }

      // Save to API
      await deleteVideoFromAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Module deleted successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to delete module:', error);
      // Revert changes on error
      setModules(modules);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to delete module!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    setDeleteModal({ isOpen: false, type: null, id: '', title: '' });
  };

  const handleEditVideo = (video: Topic) => {
    setEditingVideo(video.id);
    setEditVideoData({
      title: video.title,
      videoUrl: video.videoUrl,
      notes: video.notes
    });
  };

  const handleSaveVideo = async (moduleId: string, videoId: string) => {
    if (editVideoData.title.trim()) {
      try {
        // Update local state first
        const updatedModules = modules.map(module => 
          module.id === moduleId 
            ? {
                ...module,
                topics: module.topics.map(topic =>
                  topic.id === videoId
                    ? {
                        ...topic,
                        title: editVideoData.title.trim(),
                        videoUrl: editVideoData.videoUrl.trim(),
                        notes: editVideoData.notes.trim()
                      }
                    : topic
                )
              }
            : module
        );
        setModules(updatedModules);

        // Save to API
        await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Video saved successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to save video:', error);
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to save video!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }
    }
    setEditingVideo(null);
    setEditVideoData({ title: '', videoUrl: '', notes: '' });
  };

  const handleCancelVideoEdit = () => {
    setEditingVideo(null);
    setEditVideoData({ title: '', videoUrl: '', notes: '' });
  };

  const handleDeleteVideo = (moduleId: string, videoId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const video = module?.topics.find(t => t.id === videoId);
    setDeleteModal({
      isOpen: true,
      type: 'video',
      id: videoId,
      moduleId: moduleId,
      title: video?.title || 'Video'
    });
  };

  const confirmDeleteVideo = async (moduleId: string, videoId: string) => {
    try {
      // Update local state first
      const updatedModules = modules.map(module => 
        module.id === moduleId 
          ? { ...module, topics: module.topics.filter(topic => topic.id !== videoId) }
          : module
      );
      setModules(updatedModules);
      
      // If we're deleting the currently playing video, clear it
      if (currentTopic?.id === videoId) {
        setCurrentTopic(null);
      }

      // Delete from API
      await deleteVideoFromAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Video deleted successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to delete video:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to delete video!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    setDeleteModal({ isOpen: false, type: null, id: '', title: '' });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: '', title: '' });
  };

  // Playlist Import Functions
  const handlePlaylistPreview = async () => {
    if (!playlistUrl.trim()) {
      showToast('Please enter a playlist URL', 'error');
      return;
    }

    setIsLoadingPlaylist(true);
    
    try {
      const response = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        setPlaylistPreview(result.data);
        showToast(`Found ${result.data.videos.length} videos in playlist "${result.data.playlistTitle}"`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error fetching playlist:', error);
      showToast(error.message || 'Failed to fetch playlist', 'error');
      setPlaylistPreview(null);
    } finally {
      setIsLoadingPlaylist(false);
    }
  };

  const handleImportPlaylist = async () => {
    if (!playlistPreview) {
      showToast('No playlist data to import', 'error');
      return;
    }

    try {
      // Create new module with playlist data
      const newModuleId = `module-${Date.now()}`;
      const playlistVideos: Topic[] = playlistPreview.videos.map(video => ({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        notes: `Imported from playlist: ${playlistPreview.playlistTitle}`,
        comments: []
      }));

      const newModule: Module = {
        id: newModuleId,
        name: playlistPreview.playlistTitle,
        topics: playlistVideos
      };

      // Update local state
      const updatedModules = [...modules, newModule];
      setModules(updatedModules);

      // Save to API
      await updateVideoInAPI(year, semester, branch, subjectName, { modules: updatedModules });

      showToast(`Successfully imported playlist "${playlistPreview.playlistTitle}" with ${playlistVideos.length} videos!`, 'success');
      
      // Reset import dialog
      setIsImportingPlaylist(false);
      setPlaylistUrl('');
      setPlaylistPreview(null);

    } catch (error) {
      console.error('Failed to import playlist:', error);
      showToast('Failed to import playlist', 'error');
    }
  };

  const resetPlaylistImport = () => {
    setPlaylistUrl('');
    setPlaylistPreview(null);
    setIsLoadingPlaylist(false);
  };

  // Helper function to show toast messages
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300`;
    toast.textContent = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <section className="bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousTopic}
              disabled={!previousTopic}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Topic</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {currentTopic?.title || 'Select a topic'}
              </h1>
            </div>

            <Button 
              variant="outline" 
              onClick={handleNextTopic}
              disabled={!nextTopic}
              className="flex items-center space-x-2"
            >
              <span>Next Topic</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Notes
          </Button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Video and Discussion Section */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Video Tab */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-0">
                {currentTopic ? (
                  <div>
                    <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                      <iframe
                        src={convertToEmbedUrl(currentTopic.videoUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentTopic.title}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        {currentTopic.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                          </svg>
                          Video
                        </span>
                        <Badge variant="secondary" className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground">
                          {subject.name}
                        </Badge>
                      </div>
                      <p className="mt-3 text-muted-foreground">{currentTopic.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                      </svg>
                      <p className="text-muted-foreground">Select a topic to start watching</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion / Comments Section */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Discussion / Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-muted dark:bg-[oklch(0.225_0_0)] rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">You</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background dark:bg-[oklch(0.205_0_0)] text-foreground"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {currentTopic?.comments && currentTopic.comments.length > 0 ? (
                    currentTopic.comments.map((comment) => (
                      <CommentComponent 
                        key={comment.id} 
                        comment={comment}
                        onReply={toggleReply}
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        onReplySubmit={handleReplySubmit}
                        onToggleReply={toggleReply}
                        onLikeComment={handleLikeComment}
                        onDislikeComment={handleDislikeComment}
                        onDeleteComment={handleDeleteComment}
                        currentUserId={currentUser?.id}
                        isAdmin={isAdmin}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-2">
                        <svg className="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm">No comments yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Be the first to start a discussion about this video!</p>
                        </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Modules (Increased Size) */}
          <div className="xl:col-span-1">
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Course Content</h3>
                
                <div className="space-y-3">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setSelectedModule(selectedModule === module.id ? '' : module.id)}
                        className="w-full text-left p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] hover:bg-muted dark:hover:bg-[oklch(0.225_0_0)] rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{module.name}</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${selectedModule === module.id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {selectedModule === module.id && (
                        <div className="mt-2 space-y-2">
                          {/* Module Edit Section - Only show for admins */}
                          {isAdmin && (
                          <div className="p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-lg border">
                            {editingModule === module.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editModuleName}
                                  onChange={(e) => setEditModuleName(e.target.value)}
                                  className="w-full p-2 text-sm border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Module name"
                                  autoFocus
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleSaveModuleName(module.id)}
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEdit}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Module Actions</span>
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => handleEditModule(module.id, module.name)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteModule(module.id)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          )}

                          {/* Topics List */}
                          {module.topics.map((topic) => (
                            <div key={topic.id} className="space-y-2">
                              {editingVideo === topic.id ? (
                                <div className="p-3 bg-secondary dark:bg-[oklch(0.225_0_0)] rounded-lg border border-border">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-foreground mb-1">Video Title</label>
                                      <input
                                        type="text"
                                        value={editVideoData.title}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full p-2 text-sm border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Video title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-foreground mb-1">YouTube URL</label>
                                      <input
                                        type="text"
                                        value={editVideoData.videoUrl}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                        className="w-full p-2 text-sm border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.youtube.com/embed/..."
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
                                      <textarea
                                        value={editVideoData.notes}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full p-2 text-sm border border-border bg-background text-foreground rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Video description..."
                                        rows={2}
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => handleSaveVideo(module.id, topic.id)}
                                        size="sm"
                                        className="bg-green-600 text-white hover:bg-green-700"
                                      >
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save
                                      </Button>
                                      <Button
                                        onClick={handleCancelVideoEdit}
                                        size="sm"
                                        variant="outline"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleTopicChange(topic)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                                      currentTopic?.id === topic.id 
                                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black' 
                                        : 'bg-white dark:bg-[oklch(0.225_0_0)] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[oklch(0.245_0_0)] text-black dark:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                                      </svg>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{topic.title}</p>
                                      </div>
                                    </div>
                                  </button>
                                  
                                  {/* Video Action Buttons - Only show for admins */}
                                  {isAdmin && (
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditVideo(topic);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-6 w-6 p-0 bg-background dark:bg-[oklch(0.205_0_0)] border-border  text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </Button>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteVideo(module.id, topic.id);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-6 w-6 p-0 bg-background dark:bg-[oklch(0.205_0_0)] border-border text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </Button>
                                    </div>
                                  </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add Video Button - Only show for admins */}
                          {isAdmin && (
                          <Button
                            onClick={() => handleAddVideo(module.id)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Video
                          </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Admin Buttons Section - Add Module and Import Playlist */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <Button
                        onClick={handleAddModule}
                        variant="outline"
                        className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Module
                      </Button>
                      
                      <Button
                        onClick={() => setIsImportingPlaylist(true)}
                        variant="outline"
                        className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Import Playlist
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">
                Delete {deleteModal.type === 'module' ? 'Module' : 'Video'}
              </h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCloseDeleteModal}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteModal.type === 'module') {
                    confirmDeleteModule(deleteModal.id);
                  } else if (deleteModal.type === 'video' && deleteModal.moduleId) {
                    confirmDeleteVideo(deleteModal.moduleId, deleteModal.id);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Import Dialog */}
      <Dialog open={isImportingPlaylist} onOpenChange={setIsImportingPlaylist}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import YouTube Playlist</DialogTitle>
            <DialogDescription>
              Import an entire YouTube playlist as a new module. Enter the playlist URL and preview the videos before importing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Playlist URL Input */}
            <div className="space-y-2">
              <Label htmlFor="playlistUrl">YouTube Playlist URL</Label>
              <div className="flex gap-2">
                <Input
                  id="playlistUrl"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="flex-1"
                />
                <Button 
                  onClick={handlePlaylistPreview}
                  disabled={isLoadingPlaylist || !playlistUrl.trim()}
                  className="whitespace-nowrap"
                >
                  {isLoadingPlaylist ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Preview'
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: playlist URLs from YouTube
              </p>
            </div>

            {/* Playlist Preview */}
            {playlistPreview && (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">
                    📋 {playlistPreview.playlistTitle}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {playlistPreview.videos.length} videos will be imported as a new module
                  </p>
                </div>

                {/* Video List Preview */}
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <div className="p-3 border-b bg-secondary/50">
                    <h5 className="font-medium text-sm">Videos to Import:</h5>
                  </div>
                  <div className="divide-y">
                    {playlistPreview.videos.slice(0, 10).map((video, index) => (
                      <div key={video.id} className="p-3 flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {video.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {video.videoUrl}
                          </p>
                        </div>
                      </div>
                    ))}
                    {playlistPreview.videos.length > 10 && (
                      <div className="p-3 text-center text-sm text-muted-foreground">
                        ... and {playlistPreview.videos.length - 10} more videos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsImportingPlaylist(false);
              resetPlaylistImport();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportPlaylist}
              disabled={!playlistPreview}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Import {playlistPreview ? playlistPreview.videos.length : ''} Videos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 