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

export default function NotesClient({ subject, subjectVideos, subjectName }: NotesClientProps) {
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [newComment, setNewComment] = useState('');
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (subjectVideos?.modules?.length > 0) {
      setCurrentModule(subjectVideos.modules[0]);
    }
  }, [subjectVideos]);

  useEffect(() => {
    // Reset PDF error when module changes
    setPdfError(false);
  }, [currentModule]);

  const currentIndex = subjectVideos.modules.findIndex(module => module.id === currentModule?.id);
  const previousModule = currentIndex > 0 ? subjectVideos.modules[currentIndex - 1] : null;
  const nextModule = currentIndex < subjectVideos.modules.length - 1 ? subjectVideos.modules[currentIndex + 1] : null;

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Notes and Discussion Section */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Notes Tab - Larger than video tab */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                {currentModule ? (
                  <div>
                    <div className="bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '70vh' }}>
                      {!pdfError ? (
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview Unavailable</h3>
                            <p className="text-gray-600 mb-4">The PDF cannot be displayed in preview mode.</p>
                            <Button 
                              onClick={handleDownloadPdf}
                              className="bg-gray-900 text-white hover:bg-gray-800"
                            >
                              Open PDF in New Tab
                            </Button>
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

          {/* Right Sidebar - Modules */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Notes</h3>
                
                <div className="space-y-3">
                  {subjectVideos.modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => handleModuleChange(module)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        currentModule?.id === module.id 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{module.name}</p>
                          <p className={`text-xs mt-1 ${currentModule?.id === module.id ? 'text-gray-300' : 'text-gray-500'}`}>
                            {module.topics.length} topics • PDF Notes
                          </p>
                          {module.relatedVideoLink && (
                            <div className={`flex items-center mt-1 text-xs ${currentModule?.id === module.id ? 'text-gray-300' : 'text-blue-600'}`}>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H15" />
                              </svg>
                              Video available
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 