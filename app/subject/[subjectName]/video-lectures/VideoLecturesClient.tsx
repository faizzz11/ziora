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

export default function VideoLecturesClient({ subject, subjectVideos, subjectName }: VideoLecturesClientProps) {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (subjectVideos?.modules?.length > 0) {
      const firstModule = subjectVideos.modules[0];
      setSelectedModule(firstModule.id);
      if (firstModule.topics?.length > 0) {
        setCurrentTopic(firstModule.topics[0]);
      }
    }
  }, [subjectVideos]);

  const allTopics = subjectVideos.modules.flatMap(module => module.topics);
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Video and Discussion Section */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Video Tab */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                {currentTopic ? (
                  <div>
                    <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                      <iframe
                        src={currentTopic.videoUrl}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {currentTopic.duration}
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

          {/* Right Sidebar - Modules */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-gray-200 sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                
                <div className="space-y-3">
                  {subjectVideos.modules.map((module) => (
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
                          {module.topics.map((topic) => (
                            <button
                              key={topic.id}
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
                                  <p className="text-xs opacity-75">{topic.duration}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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