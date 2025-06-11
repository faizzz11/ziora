'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Topic {
  id: string;
  title: string;
  videoUrl: string;
  notes: string;
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
}

// Mock comments data (will be replaced with database later)
const mockComments = [
  {
    id: 1,
    author: "Sarah Johnson",
    time: "2 hours ago",
    content: "Great explanation! Could you please clarify the difference between process and thread?",
    replies: 3
  },
  {
    id: 2,
    author: "Mike Chen",
    time: "5 hours ago", 
    content: "The example at 8:30 was really helpful. Thanks for the clear demonstration!",
    replies: 1
  },
  {
    id: 3,
    author: "Emma Davis",
    time: "1 day ago",
    content: "I'm having trouble understanding the memory allocation part. Can someone help?",
    replies: 7
  }
];

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
const saveVideosToAPI = async (subjectName: string, videos: SubjectVideos) => {
  try {
    const response = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: subjectName,
        videos: videos,
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

const updateVideoInAPI = async (subjectName: string, moduleId: string, topicId: string, topicData: Partial<Topic>) => {
  try {
    const response = await fetch('/api/videos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: subjectName,
        moduleId,
        topicId,
        topicData,
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

const deleteVideoFromAPI = async (subjectName: string, moduleId: string, topicId: string) => {
  try {
    const response = await fetch('/api/videos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: subjectName,
        moduleId,
        topicId,
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

export default function VideoLecturesClient({ subject, subjectVideos, subjectName }: VideoLecturesClientProps) {
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

  useEffect(() => {
    if (modules?.length > 0) {
      const firstModule = modules[0];
      setSelectedModule(firstModule.id);
      if (firstModule.topics?.length > 0) {
        setCurrentTopic(firstModule.topics[0]);
      }
    }
  }, [modules]);

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // This will be connected to database later
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const handleAddModule = () => {
    const newModuleId = `module-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      name: `New Module ${modules.length + 1}`,
      topics: []
    };
    setModules(prev => [...prev, newModule]);
  };

  const handleAddVideo = async (moduleId: string) => {
    const newVideoId = `topic-${Date.now()}`;
    const newVideo: Topic = {
      id: newVideoId,
      title: 'New Video Topic',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: 'Add description for this video topic'
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
      await updateVideoInAPI(subjectName, moduleId, newVideoId, newVideo);
      
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

  const handleSaveModuleName = (moduleId: string) => {
    if (editModuleName.trim()) {
      setModules(prev => prev.map(module => 
        module.id === moduleId 
          ? { ...module, name: editModuleName.trim() }
          : module
      ));
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

  const confirmDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(module => module.id !== moduleId));
    
    // If we're deleting the currently selected module, clear selection
    if (selectedModule === moduleId) {
      setSelectedModule('');
      setCurrentTopic(null);
    }
    
    // If the current topic belongs to the deleted module, clear it
    if (currentTopic && modules.find(m => m.id === moduleId)?.topics.some(t => t.id === currentTopic.id)) {
      setCurrentTopic(null);
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
        await updateVideoInAPI(subjectName, moduleId, videoId, {
          title: editVideoData.title.trim(),
          videoUrl: editVideoData.videoUrl.trim(),
          notes: editVideoData.notes.trim()
        });
        
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
      await deleteVideoFromAPI(subjectName, moduleId, videoId);
      
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

  return (
    <>
      {/* Top Navigation Bar */}
      <section className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
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
              <h1 className="text-lg font-semibold text-gray-900">
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

          <Button className="bg-gray-900 text-white hover:bg-gray-800">
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
            <Card className="bg-white border border-gray-200">
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
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {currentTopic.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                          </svg>
                          Video
                        </span>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {subject.name}
                        </Badge>
                      </div>
                      <p className="mt-3 text-gray-600">{currentTopic.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                      </svg>
                      <p className="text-gray-600">Select a topic to start watching</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion / Comments Section */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion / Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">You</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">{comment.time}</span>
                        </div>
                        <p className="text-gray-700 mb-2">{comment.content}</p>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          {comment.replies} replies
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Modules (Increased Size) */}
          <div className="xl:col-span-1">
            <Card className="bg-white border border-gray-200 sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                
                <div className="space-y-3">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setSelectedModule(selectedModule === module.id ? '' : module.id)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{module.name}</span>
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
                          {/* Module Edit Section */}
                          <div className="p-3 bg-gray-100 rounded-lg border">
                            {editingModule === module.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editModuleName}
                                  onChange={(e) => setEditModuleName(e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <span className="text-sm font-medium text-gray-700">Module Actions</span>
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => handleEditModule(module.id, module.name)}
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
                              </div>
                            )}
                          </div>

                          {/* Topics List */}
                          {module.topics.map((topic) => (
                            <div key={topic.id} className="space-y-2">
                              {editingVideo === topic.id ? (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Video Title</label>
                                      <input
                                        type="text"
                                        value={editVideoData.title}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Video title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">YouTube URL</label>
                                      <input
                                        type="text"
                                        value={editVideoData.videoUrl}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, videoUrl: e.target.value }))}
                                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.youtube.com/embed/..."
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                      <textarea
                                        value={editVideoData.notes}
                                        onChange={(e) => setEditVideoData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                                        ? 'bg-gray-900 text-white' 
                                        : 'bg-white border border-gray-200 hover:bg-gray-50'
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
                                  
                                  {/* Video Action Buttons */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditVideo(topic);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-6 w-6 p-0 bg-white border-gray-300"
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
                                        className="h-6 w-6 p-0 bg-white border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add Video Button */}
                          <Button
                            onClick={() => handleAddVideo(module.id)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Video
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Module Button */}
                  <Button
                    onClick={handleAddModule}
                    variant="outline"
                    className="w-full mt-4 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Module
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete {deleteModal.type === 'module' ? 'Module' : 'Video'}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
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
    </>
  );
} 