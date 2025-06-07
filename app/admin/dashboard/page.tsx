"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, Video, FileText, BookOpen, Users, BarChart3, ArrowLeft, Clock, ExternalLink, Play } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

// Types
interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics: string[];
  materials: string;
  color: string;
}

interface VideoTopic {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  notes: string;
}

interface VideoModule {
  id: string;
  name: string;
  pdfUrl: string;
  relatedVideoLink: string;
  topics: VideoTopic[];
}

interface PYQPaper {
  id: string;
  title: string;
  year: string;
  month: string;
  fileName: string;
  imagePreview: string;
}

interface ActivityItem {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

const AdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [videoLectures, setVideoLectures] = useState<{[key: string]: {modules: VideoModule[]}}>({});
  const [pyqData, setPyqData] = useState<{[key: string]: {subjectName: string, papers: PYQPaper[]}}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading data from JSON files
      const subjectsData: Subject[] = [
        { id: "operating-system", name: "Operating System", description: "Learn about OS concepts, processes, memory management, and file systems.", icon: "💻", topics: ["Process Management", "Memory Systems", "File Systems"], materials: "145 Resources", color: "blue" },
        { id: "computer-network", name: "Computer Network", description: "Master networking protocols, TCP/IP, and network security.", icon: "🌐", topics: ["Network Protocols", "TCP/IP Stack", "Network Security"], materials: "120 Resources", color: "green" }
      ];
      setSubjects(subjectsData);
      showNotification('Data loaded successfully');
    } catch (error) {
      showNotification('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  // Subject Management
  const SubjectManager = () => {
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSaveSubject = (subject: Subject) => {
      if (editingSubject) {
        setSubjects(prev => prev.map(s => s.id === subject.id ? subject : s));
        showNotification('Subject updated successfully');
      } else {
        setSubjects(prev => [...prev, { ...subject, id: Date.now().toString() }]);
        showNotification('Subject created successfully');
      }
      setIsDialogOpen(false);
      setEditingSubject(null);
    };

    const handleDeleteSubject = (id: string) => {
      setSubjects(prev => prev.filter(s => s.id !== id));
      showNotification('Subject deleted successfully');
    };

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h2>
            <p className="text-lg text-gray-600">Create, edit, and manage your course subjects</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingSubject(null)}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] rounded-2xl border-0 p-0 bg-white shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-50 rounded-t-2xl px-8 py-6 border-b border-gray-200 flex-shrink-0">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">
                      {editingSubject ? '✏️ Edit Subject' : '➕ Add New Subject'}
                    </span>
                  </div>
                  <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {editingSubject ? 'Edit Subject Details' : 'Create New Subject'}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600">
                    {editingSubject ? 'Update subject information and settings' : 'Configure subject details and metadata for your educational platform'}
                  </DialogDescription>
                </div>
              </div>
              <div className="px-8 py-6 overflow-y-auto flex-1">
                <SubjectForm subject={editingSubject} onSave={handleSaveSubject} onCancel={() => setIsDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <span className="text-3xl">{subject.icon}</span>
                </div>
                <div className={`px-3 py-1 bg-${subject.color}-100 text-${subject.color}-800 rounded-full text-sm font-medium`}>
                  {subject.color}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                {subject.name}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {subject.description}
              </p>
              
              {/* Topics */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {subject.topics.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Materials */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Materials</h4>
                <p className="text-gray-600 text-sm">{subject.materials}</p>
              </div>
              
              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedSubject(subject);
                    setActiveTab('videos');
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Content
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingSubject(subject);
                      setIsDialogOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Module Form Component
  const ModuleForm = ({ module, onSave, onCancel }: { module: VideoModule | null, onSave: (module: Omit<VideoModule, 'id' | 'topics'>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      name: module?.name || '',
      pdfUrl: module?.pdfUrl || '',
      relatedVideoLink: module?.relatedVideoLink || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-3 block">Module Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
            placeholder="e.g., Process Management, Memory Systems"
            required
          />
        </div>
        
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-3 block">PDF URL (Optional)</Label>
          <Input
            value={formData.pdfUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, pdfUrl: e.target.value }))}
            className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
            placeholder="https://example.com/module-notes.pdf"
          />
        </div>
        
        <div>
          <Label className="text-sm font-semibold text-gray-900 mb-3 block">Related Video Link (Optional)</Label>
          <Input
            value={formData.relatedVideoLink}
            onChange={(e) => setFormData(prev => ({ ...prev, relatedVideoLink: e.target.value }))}
            className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transition-colors"
          >
            {module ? 'Update Module' : 'Create Module'}
          </button>
        </div>
      </form>
    );
  };

  // Topic Form Component
  const TopicForm = ({ topic, onSave, onCancel }: { topic: VideoTopic | null, onSave: (topic: Omit<VideoTopic, 'id'>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
      title: topic?.title || '',
      videoUrl: topic?.videoUrl || '',
      duration: topic?.duration || '',
      notes: topic?.notes || ''
    });
    const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    // Convert YouTube URL to embed format if needed
    const getEmbedUrl = (url: string) => {
      if (!url) return '';
      
      // If already embed URL, return as is
      if (url.includes('embed')) return url;
      
      // Convert various YouTube URL formats to embed URL
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
      
      // If it's already a valid embed URL or other video URL, return as is
      return url;
    };

    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'form'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Topic Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👀 Preview
          </button>
        </div>

        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  🎥
                </span>
                Video Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-3 block">Topic Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
                    placeholder="e.g., Introduction to Process Scheduling"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-900 mb-3 block">Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
                    placeholder="e.g., 15:30, 1h 25m"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">Video URL</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
                  placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtube.com/embed/VIDEO_ID"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Accepts both YouTube watch and embed URL formats</p>
              </div>
            </div>

            {/* Content Description */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  📝
                </span>
                Content & Notes
              </h3>
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">Description/Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={6}
                  className="rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
                  placeholder="Describe what students will learn in this video lecture..."
                />
                <p className="text-xs text-gray-500 mt-2">This will be shown as the video description to students</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => setActiveTab('preview')}
                className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                disabled={!formData.videoUrl || !formData.title}
              >
                👀 Preview Video
              </button>
              <div className="flex space-x-4">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transition-colors"
                >
                  {topic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Preview Tab */
          <div className="space-y-6">
            {formData.videoUrl && formData.title ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                 {/* Video Player */}
                 <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
                   <iframe
                     src={getEmbedUrl(formData.videoUrl)}
                     className="w-full h-full border-0"
                     allowFullScreen
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     title={formData.title}
                     loading="lazy"
                   />
                 </div>
                
                {/* Video Info */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {formData.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formData.duration || 'Duration not set'}
                    </span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      Preview Mode
                    </Badge>
                  </div>
                  {formData.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-200">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Video className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Preview Not Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Please fill in the video URL and title in the form to see the preview
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="mt-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  ← Back to Form
                </button>
              </div>
            )}

            {/* Preview Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => setActiveTab('form')}
                className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                ← Edit Details
              </button>
              <div className="flex space-x-4">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transition-colors"
                  disabled={!formData.videoUrl || !formData.title}
                >
                  {topic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Subject Form Component
  const SubjectForm = ({ subject, onSave, onCancel }: { subject: Subject | null, onSave: (subject: Subject) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Subject>(
      subject || { id: '', name: '', description: '', icon: '', topics: [], materials: '', color: 'blue' }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              📚
            </span>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Subject Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
                placeholder="Enter subject name"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Icon (Emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="💻"
                className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-center text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
              placeholder="Describe what students will learn in this subject..."
            />
          </div>
        </div>

        {/* Content Configuration Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              ⚙️
            </span>
            Content Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Key Topics</Label>
              <Input
                value={formData.topics.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value.split(', ').filter(Boolean) }))}
                placeholder="Process Management, Memory Systems, File Systems"
                className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">Separate topics with commas</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">Materials Count</Label>
              <Input
                value={formData.materials}
                onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                placeholder="150 Resources"
                className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">e.g., "150 Resources" or "25 Videos"</p>
            </div>
          </div>
        </div>

        {/* Visual Settings Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              🎨
            </span>
            Visual Settings
          </h3>
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Color Theme</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
              <SelectTrigger className="h-12 rounded-2xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base text-gray-900">
                <SelectValue placeholder="Choose a color theme" className="text-gray-900 placeholder:text-gray-500" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="blue" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                    <span>Blue</span>
                  </div>
                </SelectItem>
                <SelectItem value="green" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                    <span>Green</span>
                  </div>
                </SelectItem>
                <SelectItem value="purple" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                    <span>Purple</span>
                  </div>
                </SelectItem>
                <SelectItem value="orange" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span>Orange</span>
                  </div>
                </SelectItem>
                <SelectItem value="red" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                    <span>Red</span>
                  </div>
                </SelectItem>
                <SelectItem value="indigo" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6366F1' }}></div>
                    <span>Indigo</span>
                  </div>
                </SelectItem>
                <SelectItem value="pink" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EC4899' }}></div>
                    <span>Pink</span>
                  </div>
                </SelectItem>
                <SelectItem value="teal" className="rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#14B8A6' }}></div>
                    <span>Teal</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">This color will be used for subject branding</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-4 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
                         {subject ? 'Update Subject' : 'Create Subject'}
          </button>
        </div>
      </form>
    );
  };

  // Video Manager Component
  const VideoManager = ({ subject }: { subject: Subject }) => {
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [editingModule, setEditingModule] = useState<VideoModule | null>(null);
    const [selectedModule, setSelectedModule] = useState<VideoModule | null>(null);
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [editingTopic, setEditingTopic] = useState<VideoTopic | null>(null);
    const [previewingTopic, setPreviewingTopic] = useState<VideoTopic | null>(null);

    // Get modules for current subject
    const currentModules = videoLectures[subject.id]?.modules || [];
    
    // Debug logging
    console.log('Current subject:', subject.id);
    console.log('All video lectures:', videoLectures);
    console.log('Current modules:', currentModules);

    const handleSaveModule = (moduleData: Omit<VideoModule, 'id' | 'topics'>) => {
      if (editingModule) {
        // Update existing module
        const updatedModules = currentModules.map(m => 
          m.id === editingModule.id 
            ? { ...m, ...moduleData }
            : m
        );
        setVideoLectures(prev => ({
          ...prev,
          [subject.id]: { modules: updatedModules }
        }));
        setEditingModule(null);
      } else {
        // Create new module
        const newModule: VideoModule = {
          id: Date.now().toString(),
          ...moduleData,
          topics: []
        };
        const updatedLectures = {
          ...videoLectures,
          [subject.id]: { 
            modules: [...(videoLectures[subject.id]?.modules || []), newModule] 
          }
        };
        console.log('Creating new module:', newModule);
        console.log('Updated lectures state:', updatedLectures);
        setVideoLectures(updatedLectures);
      }
      setIsAddingModule(false);
      showNotification(editingModule ? 'Module updated successfully!' : 'Module created successfully!');
    };

    const handleDeleteModule = (moduleId: string) => {
      const updatedModules = currentModules.filter(m => m.id !== moduleId);
      setVideoLectures(prev => ({
        ...prev,
        [subject.id]: { modules: updatedModules }
      }));
      setSelectedModule(null);
      showNotification('Module deleted successfully!');
    };

    const handleSaveTopic = (topicData: Omit<VideoTopic, 'id'>) => {
      if (!selectedModule) return;

      if (editingTopic) {
        // Update existing topic
        const updatedModules = currentModules.map(m => 
          m.id === selectedModule.id 
            ? {
                ...m,
                topics: m.topics.map(t => 
                  t.id === editingTopic.id 
                    ? { ...t, ...topicData }
                    : t
                )
              }
            : m
        );
        setVideoLectures(prev => ({
          ...prev,
          [subject.id]: { modules: updatedModules }
        }));
        setEditingTopic(null);
      } else {
        // Add new topic
        const newTopic: VideoTopic = {
          id: Date.now().toString(),
          ...topicData
        };
        const updatedModules = currentModules.map(m => 
          m.id === selectedModule.id 
            ? { ...m, topics: [...m.topics, newTopic] }
            : m
        );
        setVideoLectures(prev => ({
          ...prev,
          [subject.id]: { modules: updatedModules }
        }));
      }
      setIsAddingTopic(false);
      showNotification(editingTopic ? 'Topic updated successfully!' : 'Topic added successfully!');
    };

    const handleDeleteTopic = (topicId: string) => {
      if (!selectedModule) return;
      
      const updatedModules = currentModules.map(m => 
        m.id === selectedModule.id 
          ? { ...m, topics: m.topics.filter(t => t.id !== topicId) }
          : m
      );
      setVideoLectures(prev => ({
        ...prev,
        [subject.id]: { modules: updatedModules }
      }));
      showNotification('Topic deleted successfully!');
    };

    // Update selectedModule when modules change
    React.useEffect(() => {
      if (selectedModule) {
        const updatedModule = currentModules.find(m => m.id === selectedModule.id);
        setSelectedModule(updatedModule || null);
      }
    }, [currentModules, selectedModule]);

    // Convert YouTube URL to embed format
    const getEmbedUrl = (url: string) => {
      if (!url) return '';
      
      // If already embed URL, return as is
      if (url.includes('embed')) return url;
      
      // Convert various YouTube URL formats to embed URL
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
      
      // If it's already a valid embed URL or other video URL, return as is
      return url;
    };

    if (selectedModule) {
      return (
        <div className="space-y-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </button>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedModule.name}</h2>
                <p className="text-lg text-gray-600">{selectedModule.topics.length} video topics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-900 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Module Notes
              </button>
              <button
                onClick={() => setIsAddingTopic(true)}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Video Topic
              </button>
            </div>
          </div>

          {/* Module Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Video className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedModule.name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-600">
                      <FileText className="w-4 h-4 inline mr-1" />
                      PDF: {selectedModule.pdfUrl || 'Not set'}
                    </span>
                    <span className="text-sm text-gray-600">
                      <ExternalLink className="w-4 h-4 inline mr-1" />
                      Related: {selectedModule.relatedVideoLink || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingModule(selectedModule);
                  setIsAddingModule(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit Module
              </button>
            </div>
          </div>

          {/* Topics List */}
          {selectedModule.topics.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Video Topics Yet</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Add your first video topic to this module
              </p>
              <button
                onClick={() => setIsAddingTopic(true)}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Topic
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Video Topics List */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Video Topics</h3>
                        <p className="text-gray-600">Manage individual video lectures in this module</p>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {selectedModule.topics.length} topics
                      </Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {selectedModule.topics.map((topic, index) => (
                      <div key={topic.id} className="p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                              <span className="text-lg font-bold text-gray-600">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                                {topic.title}
                              </h4>
                              <div className="flex items-center space-x-6 mb-3">
                                <span className="text-sm text-gray-600 flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {topic.duration}
                                </span>
                                <span className="text-sm text-gray-600 flex items-center">
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Video Ready
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Topic {index + 1}
                                </Badge>
                              </div>
                              {topic.notes && (
                                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                  <p className="text-sm text-gray-600 line-clamp-2">{topic.notes}</p>
                                </div>
                              )}
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    setEditingTopic(topic);
                                    setIsAddingTopic(true);
                                  }}
                                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                  <Edit className="w-4 h-4 mr-1 inline" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => setPreviewingTopic(topic)}
                                  className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors"
                                >
                                  <Play className="w-4 h-4 mr-1 inline" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => handleDeleteTopic(topic.id)}
                                  className="px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-xl hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 mr-1 inline" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Content Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 sticky top-6">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{selectedModule.name}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          {selectedModule.topics.length} video lectures
                        </div>
                        {selectedModule.pdfUrl && (
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF notes available
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Topic Navigation */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedModule.topics.map((topic, index) => (
                        <button
                          key={topic.id}
                          className="w-full text-left p-3 rounded-xl transition-colors bg-white border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{topic.title}</p>
                              <p className="text-xs text-gray-500">{topic.duration}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Topic Modal */}
          <Dialog open={isAddingTopic} onOpenChange={(open) => {
            setIsAddingTopic(open);
            if (!open) {
              setEditingTopic(null);
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] rounded-2xl border-0 p-0 bg-white shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-50 rounded-t-2xl px-8 py-6 border-b border-gray-200 flex-shrink-0">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">
                      {editingTopic ? '🎥 Edit Topic' : '➕ Add Video Topic'}
                    </span>
                  </div>
                  <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {editingTopic ? 'Edit Video Topic' : 'Add Video Topic'}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600">
                    {editingTopic ? 'Update topic information and video details' : 'Add a new video lecture topic to this module'}
                  </DialogDescription>
                </div>
              </div>
              <div className="px-8 py-6 overflow-y-auto flex-1">
                <TopicForm
                  topic={editingTopic}
                  onSave={handleSaveTopic}
                  onCancel={() => {
                    setIsAddingTopic(false);
                    setEditingTopic(null);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Topic Preview Modal */}
          <Dialog open={!!previewingTopic} onOpenChange={(open) => {
            if (!open) setPreviewingTopic(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] rounded-2xl border-0 p-0 bg-white shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gray-50 rounded-t-2xl px-8 py-6 border-b border-gray-200 flex-shrink-0">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">
                      🎥 Video Preview
                    </span>
                  </div>
                  <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {previewingTopic?.title || 'Video Preview'}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600">
                    Preview how students will see this video lecture
                  </DialogDescription>
                </div>
              </div>
              <div className="px-8 py-6 overflow-y-auto flex-1">
                {previewingTopic && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      {/* Video Player */}
                      <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
                        <iframe
                          src={getEmbedUrl(previewingTopic.videoUrl)}
                          className="w-full h-full border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={previewingTopic.title}
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {previewingTopic.title}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {previewingTopic.duration}
                          </span>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {subject.name}
                          </Badge>
                        </div>
                        {previewingTopic.notes && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600">{previewingTopic.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button 
                        type="button" 
                        onClick={() => setPreviewingTopic(null)}
                        className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                      >
                        Close Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Video Lectures</h2>
            <p className="text-lg text-gray-600">Manage video modules and topics for {subject.name}</p>
          </div>
          <button 
            onClick={() => setIsAddingModule(true)}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Video Module
          </button>
        </div>

        {currentModules.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Video Modules Yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Start by creating your first video module for {subject.name}. Modules help organize related video topics together.
            </p>
            <button
              onClick={() => setIsAddingModule(true)}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentModules.map((module) => (
              <div key={module.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Video className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {module.topics.length} topics
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                  {module.name}
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{module.pdfUrl || 'No PDF attached'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span>{module.relatedVideoLink || 'No related link'}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedModule(module)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Manage Topics
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingModule(module);
                        setIsAddingModule(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Module Modal */}
        <Dialog open={isAddingModule} onOpenChange={(open) => {
          setIsAddingModule(open);
          if (!open) {
            setEditingModule(null);
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] rounded-2xl border-0 p-0 bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gray-50 rounded-t-2xl px-8 py-6 border-b border-gray-200 flex-shrink-0">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    {editingModule ? '🎬 Edit Module' : '➕ Add Video Module'}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {editingModule ? 'Edit Video Module' : 'Create Video Module'}
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600">
                  {editingModule ? 'Update module information and settings' : 'Create a new module to organize video topics for your course'}
                </DialogDescription>
              </div>
            </div>
            <div className="px-8 py-6 overflow-y-auto flex-1">
              <ModuleForm
                module={editingModule}
                onSave={handleSaveModule}
                onCancel={() => {
                  setIsAddingModule(false);
                  setEditingModule(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Notes Manager Component
  const NotesManager = ({ subject }: { subject: Subject }) => {
    const [notes, setNotes] = useState<any[]>([]);

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Study Notes</h2>
            <p className="text-lg text-gray-600">Manage PDF notes and study materials for {subject.name}</p>
          </div>
          <button className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Notes
          </button>
        </div>

        <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Notes Yet</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload PDF notes and study materials for {subject.name}
          </p>
        </div>
      </div>
    );
  };

  // PYQ Manager Component
  const PYQManager = ({ subject }: { subject: Subject }) => {
    const [papers, setPapers] = useState<PYQPaper[]>([]);

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Previous Year Questions</h2>
            <p className="text-lg text-gray-600">Manage PYQ papers and exam materials for {subject.name}</p>
          </div>
          <button className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add PYQ Paper
          </button>
        </div>

        <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No PYQ Papers Yet</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload previous year question papers for {subject.name}
          </p>
        </div>
      </div>
    );
  };

  // Experiments Manager Component
  const ExperimentsManager = ({ subject }: { subject: Subject }) => {
    const [experiments, setExperiments] = useState<any[]>([]);

    return (
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Lab Experiments</h2>
            <p className="text-lg text-gray-600">Manage practical experiments and lab manuals for {subject.name}</p>
          </div>
          <button className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Experiment
          </button>
        </div>

        <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Experiments Yet</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Add practical experiments and lab manuals for {subject.name}
          </p>
        </div>
      </div>
    );
  };

  // Activity notifications data
  const notifications: ActivityItem[] = [
    {
      name: "Added video lecture",
      description: "Operating System - Process Management",
      time: "2 hours ago",
      icon: "🎥",
      color: "#00C9A7",
    },
    {
      name: "Updated notes",
      description: "Computer Network - TCP/IP Protocol",
      time: "1 day ago",
      icon: "📝",
      color: "#FFB800",
    },
    {
      name: "Added PYQ papers",
      description: "Database Management - May 2024",
      time: "2 days ago",
      icon: "📄",
      color: "#FF3D71",
    },
    {
      name: "New subject created",
      description: "Machine Learning - AI Fundamentals",
      time: "3 days ago",
      icon: "📚",
      color: "#1E86FF",
    },
    {
      name: "Lab experiment added",
      description: "Data Structures - Binary Tree Implementation",
      time: "1 week ago",
      icon: "🔬",
      color: "#9C27B0",
    },
    {
      name: "Video module updated",
      description: "Software Engineering - SDLC Models",
      time: "1 week ago",
      icon: "🎬",
      color: "#FF5722",
    },
    {
      name: "Assignment uploaded",
      description: "Computer Graphics - 3D Modeling Project",
      time: "2 weeks ago",
      icon: "📋",
      color: "#4CAF50",
    },
    {
      name: "Quiz published",
      description: "Algorithms - Sorting & Searching Quiz",
      time: "2 weeks ago",
      icon: "🧠",
      color: "#FF9800",
    },
    {
      name: "Tutorial added",
      description: "Web Development - React Components",
      time: "3 weeks ago",
      icon: "💻",
      color: "#2196F3",
    },
    {
      name: "Study guide created",
      description: "Discrete Mathematics - Logic & Proofs",
      time: "3 weeks ago",
      icon: "📖",
      color: "#E91E63",
    },
    {
      name: "Code example added",
      description: "Python Programming - Object Oriented Design",
      time: "1 month ago",
      icon: "🐍",
      color: "#607D8B",
    },
    {
      name: "Practice test updated",
      description: "Statistics - Probability Distributions",
      time: "1 month ago",
      icon: "📊",
      color: "#795548",
    },
    {
      name: "Reference material added",
      description: "Compiler Design - Lexical Analysis",
      time: "1 month ago",
      icon: "📚",
      color: "#3F51B5",
    },
    {
      name: "Video series completed",
      description: "Artificial Intelligence - Neural Networks",
      time: "1 month ago",
      icon: "🤖",
      color: "#9E9E9E",
    },
    {
      name: "Lab manual updated",
      description: "Digital Electronics - Logic Gates",
      time: "5 weeks ago",
      icon: "⚡",
      color: "#FFEB3B",
    },
    {
      name: "Sample solutions added",
      description: "Linear Algebra - Matrix Operations",
      time: "5 weeks ago",
      icon: "🧮",
      color: "#00BCD4",
    },
    {
      name: "Interactive demo created",
      description: "Computer Vision - Image Processing",
      time: "6 weeks ago",
      icon: "👁️",
      color: "#8BC34A",
    },
    {
      name: "Course syllabus updated",
      description: "Cybersecurity - Network Security Protocols",
      time: "6 weeks ago",
      icon: "🔒",
      color: "#FF5722",
    },
    {
      name: "Presentation slides added",
      description: "Software Architecture - Design Patterns",
      time: "2 months ago",
      icon: "🎯",
      color: "#673AB7",
    },
    {
      name: "Final project guidelines",
      description: "Mobile App Development - Flutter Framework",
      time: "2 months ago",
      icon: "📱",
      color: "#009688",
    },
  ];

  const ActivityNotification = ({ name, description, icon, color, time }: ActivityItem) => {
    return (
      <div className="relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4 mb-3 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 ease-in-out hover:scale-[102%]">
        <div className="flex flex-row items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: color,
            }}
          >
            <span className="text-lg">{icon}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex flex-row items-center text-sm font-semibold text-gray-900">
              <span>{name}</span>
              <span className="mx-2 text-gray-400">·</span>
              <span className="text-xs text-gray-500 font-normal">{time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const AnimatedActivityList = ({
    className,
  }: {
    className?: string;
  }) => {
    return (
      <div
        className={cn(
          "relative flex h-[400px] w-full flex-col overflow-hidden rounded-2xl  bg-gray-50 p-4",
          className,
        )}
      >
        <AnimatedList>
          {notifications.map((item, idx) => (
            <ActivityNotification {...item} key={idx} />
          ))}
        </AnimatedList>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50/80 to-transparent"></div>
      </div>
    );
  };

  // Overview Dashboard
  const OverviewDashboard = () => (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Monitor your platform's content and performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{subjects.length}</div>
          <p className="text-gray-600">Active Subjects</p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">45</div>
          <p className="text-gray-600">Video Lectures</p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">120</div>
          <p className="text-gray-600">Notes & Materials</p>
        </div>
        
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">24</div>
          <p className="text-gray-600">PYQ Papers</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-600">Latest changes and updates</p>
        </div>
        <AnimatedActivityList />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full mb-6">
                <span className="text-sm font-medium text-gray-700">🔐 Admin Panel</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Admin <span className="text-gray-600">Dashboard</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Manage content and configuration for Ziora platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Alert className="bg-green-50 border-green-200 rounded-2xl">
            <AlertDescription className="text-green-800 font-medium">{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Subject Selection Header */}
        {selectedSubject && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{selectedSubject.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Managing: {selectedSubject.name}</h2>
                  <p className="text-gray-600">Add and manage content for this subject</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setActiveTab('subjects');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ← Back to Subjects
              </button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm">
            <TabsList className={`grid w-full ${selectedSubject ? 'grid-cols-4' : 'grid-cols-2'} bg-transparent gap-1`}>
              {!selectedSubject && (
                <>
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="subjects"
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    Subjects
                  </TabsTrigger>
                </>
              )}
              {selectedSubject && (
                <>
                  <TabsTrigger 
                    value="videos"
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    Video Lectures
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pyq"
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    PYQ Papers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="experiments"
                    className="rounded-xl data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 font-medium py-3"
                  >
                    Experiments
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {!selectedSubject && (
            <>
              <TabsContent value="overview" className="space-y-6">
                <OverviewDashboard />
              </TabsContent>

              <TabsContent value="subjects" className="space-y-6">
                <SubjectManager />
              </TabsContent>
            </>
          )}

          {selectedSubject && (
            <>
              <TabsContent value="videos" className="space-y-6">
                <VideoManager subject={selectedSubject} />
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <NotesManager subject={selectedSubject} />
              </TabsContent>

              <TabsContent value="pyq" className="space-y-6">
                <PYQManager subject={selectedSubject} />
              </TabsContent>

              <TabsContent value="experiments" className="space-y-6">
                <ExperimentsManager subject={selectedSubject} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
