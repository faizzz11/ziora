'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  duration: string;
  notes: string;
}

interface Module {
  id: string;
  name: string;
  pdfUrl: string;
  relatedVideoLink: string;
  topics: Topic[];
  comments: Comment[];
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

interface NotesClientProps {
  subject: Subject;
  subjectVideos: SubjectVideos;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

// API helper functions
const saveNotesToAPI = async (year: string, semester: string, branch: string, subject: string, content: SubjectVideos) => {
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
        subject,
        contentType: 'notes',
        content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save notes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
};

const updateNotesInAPI = async (year: string, semester: string, branch: string, subject: string, content: SubjectVideos) => {
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
        subject,
        contentType: 'notes',
        content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update notes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating notes:', error);
    throw error;
  }
};

// Recursive Comment Component - Moved outside to prevent re-rendering
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
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 16V4M9 10h2m4 0h2" />
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

CommentComponent.displayName = 'CommentComponent';

export default function NotesClient({ subject, subjectVideos, subjectName, year, semester, branch }: NotesClientProps) {
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [newComment, setNewComment] = useState('');
  const [pdfError, setPdfError] = useState(false);
  const [modules, setModules] = useState<Module[]>(subjectVideos.modules);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editModuleData, setEditModuleData] = useState({
    name: '',
    pdfUrl: '',
    relatedVideoLink: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'module' | null;
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: null,
    id: '',
    title: ''
  });

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
      // Ensure all modules have comments array and comments have like/dislike properties
      const modulesWithComments = modules.map(module => ({
        ...module,
        comments: (module.comments || []).map(comment => ({
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
      }));
      setModules(modulesWithComments);
      setCurrentModule(modulesWithComments[0]);
      setSelectedModule(modulesWithComments[0].id);
    }
  }, []);

  useEffect(() => {
    // Reset PDF error when module changes
    setPdfError(false);
  }, [currentModule]);

  const currentIndex = modules.findIndex(module => module.id === currentModule?.id);
  const previousModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;

  const handleModuleChange = (module: Module) => {
    setCurrentModule(module);
  };

  const handlePreviousModule = () => {
    if (previousModule) {
      setCurrentModule(previousModule);
    }
  };

  const handleNextModule = () => {
    if (nextModule) {
      setCurrentModule(nextModule);
    }
  };

  // Memoized comment handlers to prevent re-renders
  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule || !newComment.trim()) return;

    try {
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
          module: currentModule.name,
          type: 'notes',
          contentId: currentModule.id,
          year,
          semester,
          branch,
          userId: currentUser?.id,
          userEmail: `${currentUser?.name || 'Anonymous'}`
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
        const updatedModules = modules.map(module => {
          if (module.id === currentModule.id) {
            return { ...module, comments: [...module.comments, newCommentObj] };
          }
          return module;
        });

        setModules(updatedModules);
        setCurrentModule(updatedModules.find(m => m.id === currentModule.id) || currentModule);
      setNewComment('');

        // Also save to the existing notes API for backward compatibility
        updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules })
          .catch(error => {
            console.error('Error updating notes API:', error);
          });
      } else {
        console.error('Error saving comment to MongoDB:', result.error);
        alert('Failed to save comment. Please try again.');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment. Please try again.');
    }
  }, [currentModule, newComment, currentUser, modules, year, semester, branch, subjectName, subject.name]);

  const handleReplySubmit = useCallback((e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!currentModule || !replyContent.trim()) return;

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

    const updatedModules = modules.map(module => {
      if (module.id === currentModule.id) {
        return { ...module, comments: addReplyToComment(module.comments) };
      }
      return module;
    });

    setModules(updatedModules);
    setCurrentModule(updatedModules.find(m => m.id === currentModule.id) || currentModule);
    setReplyContent('');
    setReplyingTo(null);

    // Save to API
    updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules })
      .catch(error => {
        console.error('Error saving reply:', error);
        // Revert changes on error
        setModules(modules);
        setCurrentModule(currentModule);
      });
  }, [currentModule, replyContent, currentUser, modules, year, semester, branch, subjectName]);

  const toggleReply = useCallback((commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyContent('');
  }, [replyingTo]);

  const handleSetReplyContent = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  // Like/Dislike handlers
  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!currentModule || !currentUser?.id) return;

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

    const updatedModules = modules.map(module => {
      if (module.id === currentModule.id) {
        return { ...module, comments: updateCommentLikes(module.comments) };
      }
      return module;
    });

    try {
      setModules(updatedModules);
      setCurrentModule(updatedModules.find(m => m.id === currentModule.id) || currentModule);
      
      // Save to API
      await updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules });
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert changes on error
      setModules(modules);
      setCurrentModule(currentModule);
    }
  }, [currentModule, currentUser, modules, year, semester, branch, subjectName]);

  const handleDislikeComment = useCallback(async (commentId: string) => {
    if (!currentModule || !currentUser?.id) return;

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

    const updatedModules = modules.map(module => {
      if (module.id === currentModule.id) {
        return { ...module, comments: updateCommentDislikes(module.comments) };
      }
      return module;
    });

    try {
      setModules(updatedModules);
      setCurrentModule(updatedModules.find(m => m.id === currentModule.id) || currentModule);
      
      // Save to API
      await updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules });
    } catch (error) {
      console.error('Error updating dislike:', error);
      // Revert changes on error
      setModules(modules);
      setCurrentModule(currentModule);
    }
  }, [currentModule, currentUser, modules, year, semester, branch, subjectName]);

  // Delete comment handler (Admin only)
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!currentModule || !isAdmin) return;

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

    const updatedModules = modules.map(module => {
      if (module.id === currentModule.id) {
        return { ...module, comments: deleteCommentFromArray(module.comments) };
      }
      return module;
    });

    try {
      setModules(updatedModules);
      setCurrentModule(updatedModules.find(m => m.id === currentModule.id) || currentModule);
      
      // Save to API
      await updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
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
      setCurrentModule(currentModule);
      
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
  }, [currentModule, isAdmin, modules, year, semester, branch, subjectName]);

  const handlePdfError = () => {
    setPdfError(true);
  };

  const getPdfUrl = (url: string) => {
    // Ensure we're using the preview format
    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    return url;
  };

  const handleDownloadPdf = () => {
    if (currentModule?.pdfUrl) {
      const downloadUrl = currentModule.pdfUrl.replace('/preview', '/view');
      window.open(downloadUrl, '_blank');
    }
  };

  const handleAddModule = async () => {
    const newModuleId = `module-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      name: `New Module ${modules.length + 1}`,
      pdfUrl: "",
      relatedVideoLink: "",
      topics: [],
      comments: []
    };
    
    try {
      // Update local state first
      const updatedModules = [...modules, newModule];
      setModules(updatedModules);

      // Save to API
      await saveNotesToAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
      // Automatically start editing the new module
      handleEditModule(newModuleId, newModule.name, newModule.pdfUrl, newModule.relatedVideoLink);
      
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

  const handleEditModule = (moduleId: string, currentName: string, currentPdfUrl: string, currentVideoLink: string) => {
    setEditingModule(moduleId);
    setEditModuleData({
      name: currentName,
      pdfUrl: currentPdfUrl,
      relatedVideoLink: currentVideoLink
    });
  };

  const handleSaveModule = async (moduleId: string) => {
    if (editModuleData.name.trim()) {
      try {
        // Update local state first
        const updatedModules = modules.map(module => 
          module.id === moduleId 
            ? { 
                ...module, 
                name: editModuleData.name.trim(),
                pdfUrl: editModuleData.pdfUrl.trim(),
                relatedVideoLink: editModuleData.relatedVideoLink.trim()
              }
            : module
        );
        setModules(updatedModules);

        // Save to API
        await updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules });
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Module saved successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to save module:', error);
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to save module!';
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
    setEditModuleData({ name: '', pdfUrl: '', relatedVideoLink: '' });
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setEditModuleData({ name: '', pdfUrl: '', relatedVideoLink: '' });
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
      if (currentModule?.id === moduleId) {
        if (updatedModules.length > 0) {
          setCurrentModule(updatedModules[0]);
          setSelectedModule(updatedModules[0].id);
        } else {
          setCurrentModule(null);
          setSelectedModule('');
        }
      }

      // Save updated content to API
      await updateNotesInAPI(year, semester, branch, subjectName, { modules: updatedModules });
      
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

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: '', title: '' });
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <section className="bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousModule}
              disabled={!previousModule}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Module</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {currentModule?.name || 'Select a module'}
              </h1>
            </div>

            <Button 
              variant="outline" 
              onClick={handleNextModule}
              disabled={!nextModule}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <span>Next Module</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {currentModule?.relatedVideoLink && (
              <Button 
                variant="outline" 
                onClick={() => window.open(currentModule.relatedVideoLink, '_blank')}
                className="flex items-center space-x- cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                </svg>
                <span>Related Video</span>
              </Button>
            )}
            
            <Button 
              onClick={handleDownloadPdf}
              disabled={!currentModule?.pdfUrl}
              className="cursor-pointer bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
              </svg>
              Download PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Notes and Discussion Section */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Notes Tab - Larger than video tab */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-0">
                {currentModule ? (
                  <div>
                    <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-t-lg overflow-hidden" style={{ height: '70vh' }}>
                      {!pdfError && currentModule.pdfUrl && currentModule.pdfUrl.trim() !== '' ? (
                        <iframe
                          src={getPdfUrl(currentModule.pdfUrl)}
                          className="w-full h-full"
                          title={`${currentModule.name} Notes`}
                          style={{ border: 'none' }}
                          onError={handlePdfError}
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary dark:bg-[oklch(0.205_0_0)]">
                          <div className="text-center p-8">
                                                          <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                              <h3 className="text-lg font-medium text-foreground mb-2">
                                {!currentModule.pdfUrl || currentModule.pdfUrl.trim() === '' ? 'No PDF Set' : 'PDF Preview Unavailable'}
                              </h3>
                              <p className="text-muted-foreground mb-4">
                              {!currentModule.pdfUrl || currentModule.pdfUrl.trim() === '' 
                                ? 'Please add a PDF URL to this module to view notes.' 
                                : 'The PDF cannot be displayed in preview mode.'
                              }
                            </p>
                            {currentModule.pdfUrl && currentModule.pdfUrl.trim() !== '' && (
                            <Button 
                              onClick={handleDownloadPdf}
                                className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-500"
                            >
                              Open PDF in New Tab
                            </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        {currentModule.name} - Notes
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF Document
                        </span>
                        <Badge variant="secondary">
                          {subject.name}
                        </Badge>
                        {currentModule.relatedVideoLink && (
                          <span className="flex items-center text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Related Video Available
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-muted-foreground">
                        Comprehensive notes covering all topics in this module. Use the related video link to watch explanations for better understanding.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-t-lg flex items-center justify-center" style={{ height: '70vh' }}>
                    <div className="text-center">
                      <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-muted-foreground">Select a module to view notes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion / Comments Section */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Discussion / Comments</h3>
                <p className="text-sm text-muted-foreground mb-4">Ask questions or share insights about this module's notes</p>
                
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">You</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question about these notes or share your thoughts..."
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
                  {currentModule?.comments && currentModule.comments.length > 0 ? (
                    currentModule.comments.map((comment) => (
                      <CommentComponent 
                        key={comment.id} 
                        comment={comment} 
                        onReply={(commentId) => toggleReply(commentId)}
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
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.476L3 21l2.476-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-foreground mb-2">No comments yet</h4>
                                              <p className="text-muted-foreground">Be the first to start a discussion about this module!</p>
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Course Notes</h3>
                
                <div className="space-y-3">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setSelectedModule(selectedModule === module.id ? '' : module.id)}
                        className="cursor-pointer w-full text-left p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] hover:bg-muted dark:hover:bg-[oklch(0.225_0_0)] rounded-lg transition-colors"
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
                          {/* Module Actions Section */}
                                                        <div className="p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-lg border">
                                                         {editingModule === module.id ? (
                               <div className="space-y-3">
                                 <div>
                                   <label className="block text-xs font-medium text-muted-foreground mb-1">Module Name</label>
                                   <input
                                     type="text"
                                     value={editModuleData.name}
                                     onChange={(e) => setEditModuleData(prev => ({ ...prev, name: e.target.value }))}
                                     className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                     placeholder="Module name"
                                     autoFocus
                                   />
                                 </div>
                                 <div>
                                   <label className="block text-xs font-medium text-muted-foreground mb-1">PDF URL</label>
                                   <input
                                     type="text"
                                     value={editModuleData.pdfUrl}
                                     onChange={(e) => setEditModuleData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                                     className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                     placeholder="https://drive.google.com/file/d/.../preview"
                                   />
                                 </div>
                                 <div>
                                   <label className="block text-xs font-medium text-muted-foreground mb-1">Related Video URL</label>
                                   <input
                                     type="text"
                                     value={editModuleData.relatedVideoLink}
                                     onChange={(e) => setEditModuleData(prev => ({ ...prev, relatedVideoLink: e.target.value }))}
                                     className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                     placeholder="https://youtu.be/... (optional)"
                                   />
                                 </div>
                                 <div className="flex space-x-2">
                                   <Button
                                     onClick={() => handleSaveModule(module.id)}
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
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-muted-foreground">Module Actions</span>
                                  {isAdmin && (
                                  <div className="flex space-x-1">
                                                                         <Button
                                       onClick={() => handleEditModule(module.id, module.name, module.pdfUrl, module.relatedVideoLink)}
                                       size="sm"
                                       variant="outline"
                                       className="h-8 w-8 p-0"
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
                                  )}
                                </div>
                                
                                {/* Links Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Quick Links</label>
                                                                     <div className="flex flex-col space-y-1">
                                     {module.pdfUrl ? (
                                       <Button
                                         onClick={() => handleModuleChange(module)}
                                         size="sm"
                                         variant="outline"
                                         className="justify-start h-8 text-xs cursor-pointer"
                                       >
                                         <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                                         </svg>
                                         Open PDF
                                       </Button>
                                     ) : (
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         disabled
                                         className="justify-start h-8 text-xs text-muted-foreground"
                                       >
                                         <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                                         </svg>
                                         No PDF Set
                                       </Button>
                                     )}
                                     {module.relatedVideoLink ? (
                                       <Button
                                         onClick={() => window.open(module.relatedVideoLink, '_blank')}
                                         size="sm"
                                         variant="outline"
                                         className="justify-start h-8 text-xs cursor-pointer"
                                       >
                                         <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                                         </svg>
                                         Related Video
                                       </Button>
                                     ) : (
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         disabled
                                         className="justify-start h-8 text-xs text-muted-foreground"
                                       >
                                         <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                                         </svg>
                                         No Video Set
                                       </Button>
                                     )}
                                     <Button
                                       onClick={() => handleModuleChange(module)}
                                       size="sm"
                                       variant="outline"
                                       className="justify-start h-8 text-xs cursor-pointer"
                                     >
                                       <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                       </svg>
                                       View Notes
                                     </Button>
                                   </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Module Button - Only show for admins */}
                  {isAdmin && (
                  <Button
                    onClick={handleAddModule}
                    variant="outline"
                      className="cursor-pointer w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Module
                  </Button>
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
                Delete Module
              </h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone and will remove all associated notes and links.
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
                onClick={() => confirmDeleteModule(deleteModal.id)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 