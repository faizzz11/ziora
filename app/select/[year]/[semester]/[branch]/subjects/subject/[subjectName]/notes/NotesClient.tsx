'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

// Mock comments data for notes (will be replaced with database later)
const mockNotesComments = [
  {
    id: 1,
    author: "Alex Thompson",
    time: "1 hour ago",
    content: "Could you explain the diagram on page 15? I'm having trouble understanding the process flow.",
    replies: 2
  },
  {
    id: 2,
    author: "Maria Garcia",
    time: "3 hours ago", 
    content: "Great notes! The examples really help clarify the concepts. Thank you for sharing.",
    replies: 0
  },
  {
    id: 3,
    author: "David Kim",
    time: "6 hours ago",
    content: "Is there a practice problem set that goes with these notes? I'd like to test my understanding.",
    replies: 4
  }
];

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

  useEffect(() => {
    if (modules?.length > 0) {
      setCurrentModule(modules[0]);
      setSelectedModule(modules[0].id);
    }
  }, [modules]);

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

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // This will be connected to database later
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

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
      topics: []
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
      <section className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousModule}
              disabled={!previousModule}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Module</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentModule?.name || 'Select a module'}
              </h1>
            </div>

            <Button 
              variant="outline" 
              onClick={handleNextModule}
              disabled={!nextModule}
              className="flex items-center space-x-2"
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
                className="flex items-center space-x-2"
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
              className="bg-gray-900 text-white hover:bg-gray-800"
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
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                {currentModule ? (
                  <div>
                    <div className="bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '70vh' }}>
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
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-center p-8">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {!currentModule.pdfUrl || currentModule.pdfUrl.trim() === '' ? 'No PDF Set' : 'PDF Preview Unavailable'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {!currentModule.pdfUrl || currentModule.pdfUrl.trim() === '' 
                                ? 'Please add a PDF URL to this module to view notes.' 
                                : 'The PDF cannot be displayed in preview mode.'
                              }
                            </p>
                            {currentModule.pdfUrl && currentModule.pdfUrl.trim() !== '' && (
                              <Button 
                                onClick={handleDownloadPdf}
                                className="bg-gray-900 text-white hover:bg-gray-800"
                              >
                                Open PDF in New Tab
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {currentModule.name} - Notes
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF Document
                        </span>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
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
                      <p className="mt-3 text-gray-600">
                        Comprehensive notes covering all topics in this module. Use the related video link to watch explanations for better understanding.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-t-lg flex items-center justify-center" style={{ height: '70vh' }}>
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">Select a module to view notes</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion / Comments Section */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion / Comments</h3>
                <p className="text-sm text-gray-600 mb-4">Ask questions or share insights about this module's notes</p>
                
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
                        placeholder="Ask a question about these notes or share your thoughts..."
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
                  {mockNotesComments.map((comment) => (
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
                          {comment.replies === 0 ? 'Reply' : `${comment.replies} replies`}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Notes</h3>
                
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
                          {/* Module Actions Section */}
                          <div className="p-3 bg-gray-100 rounded-lg border">
                                                         {editingModule === module.id ? (
                               <div className="space-y-3">
                                 <div>
                                   <label className="block text-xs font-medium text-gray-700 mb-1">Module Name</label>
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
                                   <label className="block text-xs font-medium text-gray-700 mb-1">PDF URL</label>
                                   <input
                                     type="text"
                                     value={editModuleData.pdfUrl}
                                     onChange={(e) => setEditModuleData(prev => ({ ...prev, pdfUrl: e.target.value }))}
                                     className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                     placeholder="https://drive.google.com/file/d/.../preview"
                                   />
                                 </div>
                                 <div>
                                   <label className="block text-xs font-medium text-gray-700 mb-1">Related Video URL</label>
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
                                  <span className="text-sm font-medium text-gray-700">Module Actions</span>
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
                                </div>
                                
                                {/* Links Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-gray-700">Quick Links</label>
                                                                     <div className="flex flex-col space-y-1">
                                     {module.pdfUrl ? (
                                       <Button
                                         onClick={() => handleModuleChange(module)}
                                         size="sm"
                                         variant="outline"
                                         className="justify-start h-8 text-xs"
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
                                         className="justify-start h-8 text-xs text-gray-400"
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
                                         className="justify-start h-8 text-xs"
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
                                         className="justify-start h-8 text-xs text-gray-400"
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
                                       className="justify-start h-8 text-xs"
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
                Delete Module
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
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