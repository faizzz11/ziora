'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Play, Plus, Edit, Trash2, Save, X } from "lucide-react";

interface Experiment {
  experimentNo: number;
  title: string;
  aim: string;
  theory: string;
  code: string;
  output: string;
  conclusion: string;
  videoUrl: string;
}

interface PracticalsClientProps {
  experiments: Experiment[];
  subject: any;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

// API helper functions
const saveExperimentsToAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
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
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save experiments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving experiments:', error);
    throw error;
  }
};

const updateExperimentInAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
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
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update experiment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating experiment:', error);
    throw error;
  }
};

const deleteExperimentFromAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
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
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete experiment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting experiment:', error);
    throw error;
  }
};

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show toast for fallback too
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  });
};

// Component for Experiments tab
const ExperimentsTab = ({ 
  experiments, 
  onAddExperiment, 
  onEditExperiment, 
  onDeleteExperiment,
  editingExperiment,
  editExperimentData,
  setEditExperimentData,
  onSaveExperiment,
  onCancelEdit,
  isAdmin
}: { 
  experiments: Experiment[];
  onAddExperiment: () => void;
  onEditExperiment: (experiment: Experiment) => void;
  onDeleteExperiment: (experimentNo: number) => void;
  editingExperiment: number | null;
  editExperimentData: Partial<Experiment>;
  setEditExperimentData: (data: Partial<Experiment>) => void;
  onSaveExperiment: (experimentNo: number) => void;
  onCancelEdit: () => void;
  isAdmin: boolean;
}) => {
  return (
    <div className="space-y-8">
      {/* Add New Experiment Button - Only show for admins */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={onAddExperiment}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Experiment</span>
          </Button>
        </div>
      )}

      {experiments.map((experiment) => (
        <Card key={experiment.experimentNo} className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingExperiment === experiment.experimentNo ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experiment No:</label>
                      <Input
                        type="number"
                        value={editExperimentData.experimentNo || ''}
                        onChange={(e) => setEditExperimentData({
                          ...editExperimentData,
                          experimentNo: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                        placeholder="Experiment Number"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title:</label>
                      <Input
                        value={editExperimentData.title || ''}
                        onChange={(e) => setEditExperimentData({
                          ...editExperimentData,
                          title: e.target.value
                        })}
                        className="mt-1"
                        placeholder="Experiment Title"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Experiment No: {experiment.experimentNo}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                      {experiment.title}
                    </CardDescription>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
                  Lab Manual
                </Badge>
                {isAdmin && (
                  editingExperiment === experiment.experimentNo ? (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onSaveExperiment(experiment.experimentNo)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={onCancelEdit}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    isAdmin && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onEditExperiment(experiment)}
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onDeleteExperiment(experiment.experimentNo)}
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Aim Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📋 Aim:
              </h3>
              {editingExperiment === experiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.aim || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    aim: e.target.value
                  })}
                  className="min-h-[80px]"
                  placeholder="Experiment Aim"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{experiment.aim}</p>
              )}
            </div>

            {/* Theory Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📖 Theory:
              </h3>
              {editingExperiment === experiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.theory || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    theory: e.target.value
                  })}
                  className="min-h-[120px]"
                  placeholder="Theory"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{experiment.theory}</p>
              )}
            </div>

            {/* Code Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  💻 Code:
                </h3>
                {editingExperiment !== experiment.experimentNo && (
                  <Button
                    onClick={() => copyToClipboard(experiment.code)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </Button>
                )}
              </div>
              {editingExperiment === experiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.code || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    code: e.target.value
                  })}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Code"
                />
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {experiment.code}
                  </pre>
                </div>
              )}
            </div>

            {/* Output Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📊 Output:
              </h3>
              {editingExperiment === experiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.output || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    output: e.target.value
                  })}
                  className="min-h-[100px] font-mono text-sm"
                  placeholder="Output"
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                  <pre className="text-gray-800 text-sm font-mono whitespace-pre-wrap">
                    {experiment.output}
                  </pre>
                </div>
              )}
            </div>

            {/* Conclusion Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                🎯 Conclusion:
              </h3>
              {editingExperiment === experiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.conclusion || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    conclusion: e.target.value
                  })}
                  className="min-h-[80px]"
                  placeholder="Conclusion"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{experiment.conclusion}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for Experiment Videos tab
const ExperimentVideosTab = ({ 
  experiments,
  onEditVideo,
  onDeleteVideo,
  onAddVideo,
  editingVideo,
  editVideoData,
  setEditVideoData,
  onSaveVideo,
  onCancelVideoEdit,
  isAdmin
}: { 
  experiments: Experiment[];
  onEditVideo: (experiment: Experiment) => void;
  onDeleteVideo: (experimentNo: number) => void;
  onAddVideo: () => void;
  editingVideo: number | null;
  editVideoData: Partial<Experiment>;
  setEditVideoData: (data: Partial<Experiment>) => void;
  onSaveVideo: (experimentNo: number) => void;
  onCancelVideoEdit: () => void;
  isAdmin: boolean;
}) => {
  return (
    <div className="space-y-8">
      {/* Add New Video Button - Only show for admins */}
      {isAdmin && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={onAddVideo}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Video</span>
          </Button>
        </div>
      )}

      {experiments.map((experiment) => (
        <Card key={experiment.experimentNo} className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingVideo === experiment.experimentNo ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experiment No:</label>
                      <Input
                        type="number"
                        value={editVideoData.experimentNo || ''}
                        onChange={(e) => setEditVideoData({
                          ...editVideoData,
                          experimentNo: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                        placeholder="Experiment Number"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title:</label>
                      <Input
                        value={editVideoData.title || ''}
                        onChange={(e) => setEditVideoData({
                          ...editVideoData,
                          title: e.target.value
                        })}
                        className="mt-1"
                        placeholder="Experiment Title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Video URL:</label>
                      <Input
                        value={editVideoData.videoUrl || ''}
                        onChange={(e) => setEditVideoData({
                          ...editVideoData,
                          videoUrl: e.target.value
                        })}
                        className="mt-1"
                        placeholder="YouTube Video URL"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Experiment No: {experiment.experimentNo}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                      {experiment.title}
                    </CardDescription>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-gray-100 text-gray-800 px-3 py-1 flex items-center space-x-1">
                  <Play className="h-3 w-3" />
                  <span>Video</span>
                </Badge>
                {editingVideo === experiment.experimentNo ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onSaveVideo(experiment.experimentNo)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={onCancelVideoEdit}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  isAdmin && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onEditVideo(experiment)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDeleteVideo(experiment.experimentNo)}
                        size="sm"
                        variant="outline"
                        className="hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="aspect-video w-4/5 mx-auto">
              <iframe
                src={experiment.videoUrl}
                title={`${experiment.title} - Video Tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-md"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function PracticalsClient({ experiments: initialExperiments, subject, subjectName, year, semester, branch }: PracticalsClientProps) {
  const [activeTab, setActiveTab] = useState('experiments');
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [editingExperiment, setEditingExperiment] = useState<number | null>(null);
  const [editExperimentData, setEditExperimentData] = useState<Partial<Experiment>>({});
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [editVideoData, setEditVideoData] = useState<Partial<Experiment>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'experiment' | 'video' | null;
    experimentNo: number;
    title: string;
  }>({
    isOpen: false,
    type: null,
    experimentNo: 0,
    title: ''
  });

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check for admin status from localStorage
    const adminData = localStorage.getItem('admin');
    const userData = localStorage.getItem('user');
    
    if (adminData) {
      const admin = JSON.parse(adminData);
      setIsAdmin(admin.role === 'admin' || admin.isAdmin === true);
    } else if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
    }
  }, []);

  const handleAddExperiment = () => {
    const newExperimentNo = Math.max(...experiments.map(e => e.experimentNo), 0) + 1;
    const newExperiment: Experiment = {
      experimentNo: newExperimentNo,
      title: `New Experiment ${newExperimentNo}`,
      aim: "New experiment aim",
      theory: "New experiment theory",
      code: "// New experiment code",
      output: "New experiment output",
      conclusion: "New experiment conclusion",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    };
    setExperiments(prev => [...prev, newExperiment]);
    handleEditExperiment(newExperiment);
  };

  const handleEditExperiment = (experiment: Experiment) => {
    setEditingExperiment(experiment.experimentNo);
    setEditExperimentData(experiment);
  };

  const handleSaveExperiment = async (experimentNo: number) => {
    if (editExperimentData.title?.trim()) {
      try {
        // Update local state first
        const updatedExperiments = experiments.map(exp => 
          exp.experimentNo === experimentNo 
            ? { ...exp, ...editExperimentData } as Experiment
            : exp
        );
        setExperiments(updatedExperiments);

        // Save to API
        await saveExperimentsToAPI(year, semester, branch, subjectName, updatedExperiments);
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Experiment saved successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to save experiment:', error);
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to save experiment!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }
    }
    setEditingExperiment(null);
    setEditExperimentData({});
  };

  const handleCancelEdit = () => {
    setEditingExperiment(null);
    setEditExperimentData({});
  };

  const handleDeleteExperiment = (experimentNo: number) => {
    const experiment = experiments.find(e => e.experimentNo === experimentNo);
    setDeleteModal({
      isOpen: true,
      type: 'experiment',
      experimentNo,
      title: experiment?.title || ''
    });
  };

  const confirmDeleteExperiment = async (experimentNo: number) => {
    try {
      // Update local state first
      const updatedExperiments = experiments.filter(exp => exp.experimentNo !== experimentNo);
      setExperiments(updatedExperiments);

      // Delete from API
      await deleteExperimentFromAPI(year, semester, branch, subjectName, updatedExperiments);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Experiment deleted successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to delete experiment:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to delete experiment!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    setDeleteModal({ isOpen: false, type: null, experimentNo: 0, title: '' });
  };

  const handleEditVideo = (experiment: Experiment) => {
    setEditingVideo(experiment.experimentNo);
    setEditVideoData({
      experimentNo: experiment.experimentNo,
      title: experiment.title,
      videoUrl: experiment.videoUrl
    });
  };

  const handleSaveVideo = async (experimentNo: number) => {
    if (editVideoData.title?.trim()) {
      try {
        // Update local state first
        const updatedExperiments = experiments.map(exp => 
          exp.experimentNo === experimentNo 
            ? { 
                ...exp, 
                title: editVideoData.title || exp.title,
                videoUrl: editVideoData.videoUrl || exp.videoUrl,
                experimentNo: editVideoData.experimentNo || exp.experimentNo
              }
            : exp
        );
        setExperiments(updatedExperiments);

        // Save to API
        await saveExperimentsToAPI(year, semester, branch, subjectName, updatedExperiments);
        
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
    setEditVideoData({});
  };

  const handleCancelVideoEdit = () => {
    setEditingVideo(null);
    setEditVideoData({});
  };

  const handleDeleteVideo = (experimentNo: number) => {
    const experiment = experiments.find(e => e.experimentNo === experimentNo);
    setDeleteModal({
      isOpen: true,
      type: 'video',
      experimentNo,
      title: experiment?.title || ''
    });
  };

  const handleAddVideo = () => {
    const newExperimentNo = Math.max(...experiments.map(e => e.experimentNo), 0) + 1;
    const newExperiment: Experiment = {
      experimentNo: newExperimentNo,
      title: `New Video ${newExperimentNo}`,
      aim: "New video experiment aim",
      theory: "New video experiment theory",
      code: "// New video experiment code",
      output: "New video experiment output",
      conclusion: "New video experiment conclusion",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    };
    setExperiments(prev => [...prev, newExperiment]);
    handleEditVideo(newExperiment);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, experimentNo: 0, title: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-8">
          <div className="p-6 rounded-3xl bg-gray-100">
            <div className="w-12 h-12 flex items-center justify-center text-gray-700 text-2xl">📚</div>
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Practicals Code & Lab Manual
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Detailed study materials and comprehensive code & lab manuals for <span className="font-semibold">{subject.name}</span>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'experiments'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧪 Experiments & Code
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎥 Experiment Videos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {experiments.length > 0 ? (
          <>
            {activeTab === 'experiments' && (
              <ExperimentsTab 
                experiments={experiments}
                onAddExperiment={handleAddExperiment}
                onEditExperiment={handleEditExperiment}
                onDeleteExperiment={handleDeleteExperiment}
                editingExperiment={editingExperiment}
                editExperimentData={editExperimentData}
                setEditExperimentData={setEditExperimentData}
                onSaveExperiment={handleSaveExperiment}
                onCancelEdit={handleCancelEdit}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'videos' && (
              <ExperimentVideosTab 
                experiments={experiments}
                onEditVideo={handleEditVideo}
                onDeleteVideo={handleDeleteVideo}
                onAddVideo={handleAddVideo}
                editingVideo={editingVideo}
                editVideoData={editVideoData}
                setEditVideoData={setEditVideoData}
                onSaveVideo={handleSaveVideo}
                onCancelVideoEdit={handleCancelVideoEdit}
                isAdmin={isAdmin}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Experiments Available</h3>
            <p className="text-gray-600 mb-4">
              Experiments for this subject are not yet available.
            </p>
            <Button
              onClick={handleAddExperiment}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Experiment</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete {deleteModal.type === 'experiment' ? 'Experiment' : 'Video'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCloseDeleteModal}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDeleteExperiment(deleteModal.experimentNo)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 