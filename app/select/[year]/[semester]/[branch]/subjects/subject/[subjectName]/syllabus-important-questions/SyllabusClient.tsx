'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { checkAdminStatus } from '@/lib/admin-utils';

interface Module {
  moduleNo: string;
  title: string;
  hours: number;
  topics: string[];
}

interface Syllabus {
  subjectName: string;
  totalHours: number;
  modules: Module[];
}

interface Question {
  question: string;
  frequency: number;
  repetition: string;
}

interface ImpModule {
  moduleNo: string;
  title: string;
  questions: Question[];
}

interface ImpQuestions {
  subjectName: string;
  modules: ImpModule[];
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

interface SyllabusClientProps {
  subject: Subject;
  syllabus: Syllabus;
  impQuestions: ImpQuestions;
  subjectName: string;
  backUrl: string;
  year: string;
  semester: string;
  branch: string;
}

// API helper functions for syllabus
const saveSyllabusToAPI = async (year: string, semester: string, branch: string, subjectName: string, syllabusData: any) => {
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
        contentType: 'syllabus',
        content: syllabusData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save syllabus');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving syllabus:', error);
    throw error;
  }
};

const updateModuleInAPI = async (year: string, semester: string, branch: string, subjectName: string, syllabusData: any) => {
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
        contentType: 'syllabus',
        content: syllabusData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update module');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

const deleteModuleFromAPI = async (year: string, semester: string, branch: string, subjectName: string, syllabusData: any) => {
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
        contentType: 'syllabus',
        content: syllabusData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete module');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};

// API helper functions for important questions - now integrated with syllabus
const saveContentToAPI = async (year: string, semester: string, branch: string, subjectName: string, syllabusData: any, impQuestionsData: any) => {
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
        contentType: 'syllabus',
        content: {
          syllabus: syllabusData,
          impQuestions: impQuestionsData
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

export default function SyllabusClient({ subject, syllabus: initialSyllabus, impQuestions: initialImpQuestions, subjectName, backUrl, year, semester, branch }: SyllabusClientProps) {
  const [activeTab, setActiveTab] = useState('syllabus');
  const [syllabus, setSyllabus] = useState<Syllabus>({
    ...initialSyllabus,
    modules: initialSyllabus?.modules || []
  });
  const [impQuestions, setImpQuestions] = useState<ImpQuestions>({
    ...initialImpQuestions,
    modules: initialImpQuestions?.modules || []
  });
  
  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Use admin utility to check status properly
    const { isAdmin: adminStatus } = checkAdminStatus();
    setIsAdmin(adminStatus);
  }, []);
  
  // Syllabus states
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    moduleNo: string;
    title: string;
  }>({
    isOpen: false,
    moduleNo: '',
    title: ''
  });

  const [moduleForm, setModuleForm] = useState({
    moduleNo: '',
    title: '',
    hours: 0,
    topics: ['']
  });

  // Important Questions states
  const [editingQuestion, setEditingQuestion] = useState<{
    moduleNo: string;
    questionIndex: number;
    originalQuestion: Question; // Store original question for tracking
  } | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState<string | null>(null); // moduleNo
  const [deleteQuestionModal, setDeleteQuestionModal] = useState<{
    isOpen: boolean;
    moduleNo: string;
    questionIndex: number;
    question: string;
    originalQuestion: Question; // Store original question for tracking
  }>({
    isOpen: false,
    moduleNo: '',
    questionIndex: -1,
    question: '',
    originalQuestion: { question: '', frequency: 1, repetition: 'Most Repeated' }
  });

  // Important Questions Module Management states
  const [isAddingImpModule, setIsAddingImpModule] = useState(false);
  const [editingImpModule, setEditingImpModule] = useState<string | null>(null);
  const [impModuleForm, setImpModuleForm] = useState({
    moduleNo: '',
    title: ''
  });
  const [deleteImpModuleModal, setDeleteImpModuleModal] = useState<{
    isOpen: boolean;
    moduleNo: string;
    title: string;
  }>({
    isOpen: false,
    moduleNo: '',
    title: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    frequency: 1,
    repetition: 'Most Repeated'
  });

  // Repetition options
  const repetitionOptions = [
    { value: 1, label: 'Most Repeated' },
    { value: 2, label: '2nd Most Repeated' },
    { value: 3, label: '3rd Most Repeated' },
    { value: 4, label: '4th Most Repeated' },
    { value: 5, label: 'One Time Repeated' }
  ];

  // Helper function to sort questions by frequency
  const sortQuestionsByFrequency = (questions: Question[]) => {
    return [...questions].sort((a, b) => {
      // Sort by frequency (1 = Most Repeated should come first)
      if (a.frequency !== b.frequency) {
        return a.frequency - b.frequency;
      }
      // If frequencies are equal, maintain original order (stable sort)
      return 0;
    });
  };

  // Sort initial questions data on component mount
  useEffect(() => {
    setImpQuestions(prev => ({
      ...prev,
      modules: prev.modules.map(module => ({
        ...module,
        questions: sortQuestionsByFrequency(module.questions)
      }))
    }));
  }, []);

  // CRUD Functions for Syllabus
  const handleAddModule = () => {
    setIsAddingModule(true);
    setModuleForm({
      moduleNo: '',
      title: '',
      hours: 0,
      topics: ['']
    });
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module.moduleNo);
    setModuleForm({
      moduleNo: module.moduleNo,
      title: module.title,
      hours: module.hours,
      topics: [...module.topics]
    });
  };

  const handleSaveModule = async () => {
    if (!moduleForm.moduleNo.trim() || !moduleForm.title.trim()) {
      alert("Please fill in module number and title");
      return;
    }

    const filteredTopics = moduleForm.topics.filter(topic => topic.trim() !== '');
    
    if (filteredTopics.length === 0) {
      alert("Please add at least one topic");
      return;
    }

    const moduleData = {
      ...moduleForm,
      topics: filteredTopics
    };

    try {
      let updatedSyllabus;
      
      if (editingModule) {
        // Update existing module
        updatedSyllabus = {
          ...syllabus,
          modules: syllabus.modules.map(m => 
            m.moduleNo === editingModule ? moduleData : m
          ),
          totalHours: syllabus.modules.reduce((total, m) => 
            m.moduleNo === editingModule ? total - m.hours + moduleData.hours : total + m.hours, 0
          )
        };
        setEditingModule(null);
      } else {
        // Add new module
        updatedSyllabus = {
          ...syllabus,
          modules: [...syllabus.modules, moduleData],
          totalHours: syllabus.totalHours + moduleData.hours
        };
        setIsAddingModule(false);
      }

      setSyllabus(updatedSyllabus);

      // Save to API
      await saveContentToAPI(year, semester, branch, subjectName, updatedSyllabus, impQuestions);

      setModuleForm({
        moduleNo: '',
        title: '',
        hours: 0,
        topics: ['']
      });
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module');
    }
  };

  const handleDeleteModule = (module: Module) => {
    setDeleteModal({
      isOpen: true,
      moduleNo: module.moduleNo,
      title: module.title
    });
  };

  const confirmDeleteModule = async () => {
    try {
      const updatedSyllabus = {
        ...syllabus,
        modules: syllabus.modules.filter(m => m.moduleNo !== deleteModal.moduleNo),
        totalHours: syllabus.totalHours - (syllabus.modules.find(m => m.moduleNo === deleteModal.moduleNo)?.hours || 0)
      };
      
      setSyllabus(updatedSyllabus);
      
      // Save to API
      await saveContentToAPI(year, semester, branch, subjectName, updatedSyllabus, impQuestions);
      
      setDeleteModal({ isOpen: false, moduleNo: '', title: '' });
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  const handleCancelEdit = () => {
    setEditingModule(null);
    setIsAddingModule(false);
    setModuleForm({
      moduleNo: '',
      title: '',
      hours: 0,
      topics: ['']
    });
  };

  const addTopicField = () => {
    setModuleForm(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  const removeTopicField = (index: number) => {
    if (moduleForm.topics.length > 1) {
      setModuleForm(prev => ({
        ...prev,
        topics: prev.topics.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTopic = (index: number, value: string) => {
    setModuleForm(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => i === index ? value : topic)
    }));
  };

  // CRUD Functions for Important Questions Modules
  const handleAddImpModule = () => {
    setIsAddingImpModule(true);
    setImpModuleForm({
      moduleNo: '',
      title: ''
    });
  };

  const handleEditImpModule = (module: ImpModule) => {
    setEditingImpModule(module.moduleNo);
    setImpModuleForm({
      moduleNo: module.moduleNo,
      title: module.title
    });
  };

  const handleSaveImpModule = async () => {
    if (!impModuleForm.moduleNo.trim() || !impModuleForm.title.trim()) {
      alert("Please fill in module number and title");
      return;
    }

    const moduleData = {
      moduleNo: impModuleForm.moduleNo,
      title: impModuleForm.title,
      questions: []
    };

    try {
      let updatedImpQuestions;
      
      if (editingImpModule) {
        // Update existing module
        updatedImpQuestions = {
          ...impQuestions,
          modules: impQuestions.modules.map(m => 
            m.moduleNo === editingImpModule 
              ? { ...m, moduleNo: moduleData.moduleNo, title: moduleData.title }
              : m
          )
        };
        setEditingImpModule(null);
      } else {
        // Add new module
        updatedImpQuestions = {
          ...impQuestions,
          modules: [...impQuestions.modules, moduleData]
        };
        setIsAddingImpModule(false);
      }

      setImpQuestions(updatedImpQuestions);

      // Save to API
      await saveContentToAPI(year, semester, branch, subjectName, syllabus, updatedImpQuestions);

      setImpModuleForm({
        moduleNo: '',
        title: ''
      });
    } catch (error) {
      console.error('Error saving important questions module:', error);
      alert('Failed to save module');
    }
  };

  const handleDeleteImpModule = (module: ImpModule) => {
    setDeleteImpModuleModal({
      isOpen: true,
      moduleNo: module.moduleNo,
      title: module.title
    });
  };

  const confirmDeleteImpModule = async () => {
    try {
      const updatedImpQuestions = {
        ...impQuestions,
        modules: impQuestions.modules.filter(m => m.moduleNo !== deleteImpModuleModal.moduleNo)
      };
      
      setImpQuestions(updatedImpQuestions);
      
      // Save to API
      await saveContentToAPI(year, semester, branch, subjectName, syllabus, updatedImpQuestions);
      
      setDeleteImpModuleModal({ isOpen: false, moduleNo: '', title: '' });
    } catch (error) {
      console.error('Error deleting important questions module:', error);
      alert('Failed to delete module');
    }
  };

  const handleCancelImpModuleEdit = () => {
    setEditingImpModule(null);
    setIsAddingImpModule(false);
    setImpModuleForm({
      moduleNo: '',
      title: ''
    });
  };

  // CRUD Functions for Important Questions
  const handleAddQuestion = (moduleNo: string) => {
    setIsAddingQuestion(moduleNo);
    setQuestionForm({
      question: '',
      frequency: 1,
      repetition: 'Most Repeated'
    });
  };

  const handleEditQuestion = (moduleNo: string, questionIndex: number, question: Question) => {
    setEditingQuestion({ 
      moduleNo, 
      questionIndex, 
      originalQuestion: { ...question } 
    });
    setQuestionForm({
      question: question.question,
      frequency: question.frequency,
      repetition: question.repetition
    });
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const questionData = {
      ...questionForm
    };

    try {
      let updatedImpQuestions;
      
      if (editingQuestion) {
        // Update existing question by finding it using the original question data
        updatedImpQuestions = {
          ...impQuestions,
          modules: impQuestions.modules.map(module => 
            module.moduleNo === editingQuestion.moduleNo 
              ? {
                  ...module,
                  questions: sortQuestionsByFrequency(
                    module.questions.map((q) => 
                      q.question === editingQuestion.originalQuestion.question && 
                      q.frequency === editingQuestion.originalQuestion.frequency ? questionData : q
                    )
                  )
                }
              : module
          )
        };
        setEditingQuestion(null);
      } else if (isAddingQuestion) {
        // Add new question
        updatedImpQuestions = {
          ...impQuestions,
          modules: impQuestions.modules.map(module => 
            module.moduleNo === isAddingQuestion 
              ? {
                  ...module,
                  questions: sortQuestionsByFrequency([...module.questions, questionData])
                }
              : module
          )
        };
        setIsAddingQuestion(null);
      }

      if (updatedImpQuestions) {
        setImpQuestions(updatedImpQuestions);
        
        // Save to API
        await saveContentToAPI(year, semester, branch, subjectName, syllabus, updatedImpQuestions);
      }

      setQuestionForm({
        question: '',
        frequency: 1,
        repetition: 'Most Repeated'
      });
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleDeleteQuestion = (moduleNo: string, questionIndex: number, question: Question) => {
    setDeleteQuestionModal({
      isOpen: true,
      moduleNo,
      questionIndex,
      question: question.question,
      originalQuestion: { ...question }
    });
  };

  const confirmDeleteQuestion = async () => {
    try {
      const updatedImpQuestions = {
        ...impQuestions,
        modules: impQuestions.modules.map(module => 
          module.moduleNo === deleteQuestionModal.moduleNo
            ? {
                ...module,
                questions: sortQuestionsByFrequency(
                  module.questions.filter((q) => 
                    !(q.question === deleteQuestionModal.originalQuestion.question && 
                      q.frequency === deleteQuestionModal.originalQuestion.frequency)
                  )
                )
              }
            : module
        )
      };
      
      setImpQuestions(updatedImpQuestions);
      
      // Save to API
      await saveContentToAPI(year, semester, branch, subjectName, syllabus, updatedImpQuestions);
      
      setDeleteQuestionModal({ 
        isOpen: false, 
        moduleNo: '', 
        questionIndex: -1, 
        question: '',
        originalQuestion: { question: '', frequency: 1, repetition: 'Most Repeated' }
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestion(null);
    setIsAddingQuestion(null);
    setQuestionForm({
      question: '',
      frequency: 1,
      repetition: 'Most Repeated'
    });
  };

  const handleRepetitionChange = (value: string) => {
    const option = repetitionOptions.find(opt => opt.label === value);
    if (option) {
      setQuestionForm(prev => ({
        ...prev,
        frequency: option.value,
        repetition: option.label
      }));
    }
  };

  const getQuestionColor = (frequency: number) => {
    switch (frequency) {
      case 1:
        return 'text-red-600 font-semibold'; // Most repeated - Red
      case 2:
        return 'text-blue-600 font-semibold'; // 2nd most repeated - Blue  
      case 3:
        return 'text-yellow-600 font-semibold'; // 3rd most repeated - Yellow
      case 4:
        return 'text-purple-600 font-semibold'; // 4th most repeated - Purple
      default:
        return 'text-gray-900'; // One time repeated - Black
    }
  };

  const getFrequencyBadge = (frequency: number, repetition: string) => {
    const colorClasses = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-blue-100 text-blue-800 border-blue-200', 
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-purple-100 text-purple-800 border-purple-200',
      5: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[frequency as keyof typeof colorClasses] || colorClasses[5]}`}>
        {repetition}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Syllabus & Important Questions
        </h1>
        <p className="text-lg text-gray-600">
          Subject: <span className="font-semibold text-gray-900">{syllabus.subjectName}</span>
        </p>
      </div>

      {/* Tabs for Syllabus and Important Questions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="syllabus" className="text-lg py-3">📚 Syllabus</TabsTrigger>
          <TabsTrigger value="important-questions" className="text-lg py-3">❓ Important Questions</TabsTrigger>
        </TabsList>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {syllabus.subjectName} - Course Syllabus
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Total Hours: <span className="font-semibold">{syllabus.totalHours}</span>
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={handleAddModule}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Module</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Syllabus Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">Module No.</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-64">Topics</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">Hours</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(syllabus.modules || []).map((module, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {editingModule === module.moduleNo ? (
                            <Input
                              value={moduleForm.moduleNo}
                              onChange={(e) => setModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                              className="w-16"
                              placeholder="No."
                            />
                          ) : (
                            module.moduleNo
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 align-top">
                          {editingModule === module.moduleNo ? (
                            <Input
                              value={moduleForm.title}
                              onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Module Title"
                            />
                          ) : (
                            module.title
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top">
                          {editingModule === module.moduleNo ? (
                            <div className="space-y-2">
                              {moduleForm.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={topic}
                                    onChange={(e) => updateTopic(topicIndex, e.target.value)}
                                    placeholder="Topic"
                                    className="flex-1"
                                  />
                                  <Button
                                    onClick={() => removeTopicField(topicIndex)}
                                    size="sm"
                                    variant="outline"
                                    disabled={moduleForm.topics.length === 1}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                onClick={addTopicField}
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Topic
                              </Button>
                            </div>
                          ) : (
                            <ul className="space-y-1">
                              {module.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="flex items-start">
                                  <span className="text-gray-400 mr-2">•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top text-center">
                          {editingModule === module.moduleNo ? (
                            <Input
                              type="number"
                              value={moduleForm.hours}
                              onChange={(e) => setModuleForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                              className="w-16"
                              placeholder="0"
                            />
                          ) : (
                            String(module.hours).padStart(2, '0')
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm align-top">
                          {editingModule === module.moduleNo ? (
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleSaveModule}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
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
                                  onClick={() => handleEditModule(module)}
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteModule(module)}
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                        {syllabus.totalHours}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add New Module Form */}
          {isAddingModule && (
            <Card className="bg-blue-50 border border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900">Add New Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="moduleNo">Module No.</Label>
                    <Input
                      id="moduleNo"
                      value={moduleForm.moduleNo}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                      placeholder="e.g., 1, 2, 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Module Title</Label>
                    <Input
                      id="title"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={moduleForm.hours}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Topics</Label>
                  <div className="space-y-2">
                    {moduleForm.topics.map((topic, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={topic}
                          onChange={(e) => updateTopic(index, e.target.value)}
                          placeholder="Enter topic"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeTopicField(index)}
                          size="sm"
                          variant="outline"
                          disabled={moduleForm.topics.length === 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={addTopicField}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Topic
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveModule}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Module
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Important Questions Tab */}
        <TabsContent value="important-questions" className="space-y-6">
          {/* Header with Add Module Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Important Questions by Module</h2>
              <p className="text-gray-600 mt-1">Manage modules and their important questions</p>
            </div>
            {isAdmin && (
              <Button
                onClick={handleAddImpModule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Module</span>
              </Button>
            )}
          </div>

          {/* Legend */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Question Frequency Legend:</h3>
              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-red-600 font-semibold">Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-blue-600 font-semibold">2nd Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-yellow-600 font-semibold">3rd Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-purple-600 font-semibold">4th Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-gray-900">One Time Repeated</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
                <span className="text-blue-500">ℹ️</span>
                <span><strong>Auto-Sorted:</strong> Questions are automatically arranged by repetition frequency - Most Repeated questions appear first, followed by 2nd Most Repeated, and so on.</span>
              </div>
            </CardContent>
          </Card>

          {/* Important Questions by Module */}
          <div className="space-y-6">
            {(impQuestions.modules || []).map((module, moduleIndex) => (
              <Card key={moduleIndex} className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {editingImpModule === module.moduleNo ? (
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Input
                            value={impModuleForm.moduleNo}
                            onChange={(e) => setImpModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                            placeholder="Module No."
                            className="w-24"
                          />
                          <Input
                            value={impModuleForm.title}
                            onChange={(e) => setImpModuleForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Module Title"
                            className="flex-1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveImpModule}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={handleCancelImpModuleEdit}
                            size="sm"
                            variant="outline"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          Module {module.moduleNo} - {module.title}
                        </CardTitle>
                        {isAdmin && (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleEditImpModule(module)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteImpModule(module)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleAddQuestion(module.moduleNo)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-2"
                              size="sm"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Question</span>
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {(module.questions || []).map((question, questionIndex) => (
                      <div key={`${question.question}-${question.frequency}-${questionIndex}`} className="border-l-4 border-gray-200 pl-4 py-2">
                        {editingQuestion?.moduleNo === module.moduleNo && 
                         editingQuestion?.originalQuestion.question === question.question &&
                         editingQuestion?.originalQuestion.frequency === question.frequency ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="editQuestion">Question</Label>
                              <Textarea
                                id="editQuestion"
                                value={questionForm.question}
                                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="Enter the question"
                                className="mt-1"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="editRepetition">Repetition Type</Label>
                              <Select value={questionForm.repetition} onValueChange={handleRepetitionChange}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select repetition type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {repetitionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.label}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleSaveQuestion}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelQuestionEdit}
                                size="sm"
                                variant="outline"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className={`text-sm leading-relaxed ${getQuestionColor(question.frequency)}`}>
                                <span className="font-medium">Q{questionIndex + 1}.</span> {question.question}
                              </p>
                            </div>
                            <div className="ml-4 flex items-center space-x-2">
                              {getFrequencyBadge(question.frequency, question.repetition)}
                              {isAdmin && (
                                <div className="flex space-x-1">
                                  <Button
                                    onClick={() => handleEditQuestion(module.moduleNo, questionIndex, question)}
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-blue-50"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteQuestion(module.moduleNo, questionIndex, question)}
                                    size="sm"
                                    variant="outline"
                                    className="hover:bg-red-50 text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New Question Form */}
                    {isAddingQuestion === module.moduleNo && (
                      <div className="border-l-4 border-green-200 pl-4 py-2 bg-green-50 rounded-r-lg">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="newQuestion">New Question</Label>
                            <Textarea
                              id="newQuestion"
                              value={questionForm.question}
                              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                              placeholder="Enter the question"
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label htmlFor="newRepetition">Repetition Type</Label>
                            <Select value={questionForm.repetition} onValueChange={handleRepetitionChange}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select repetition type" />
                              </SelectTrigger>
                              <SelectContent>
                                {repetitionOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.label}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleSaveQuestion}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save Question
                            </Button>
                            <Button
                              onClick={handleCancelQuestionEdit}
                              size="sm"
                              variant="outline"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Module Form for Important Questions */}
            {isAddingImpModule && (
              <Card className="bg-blue-50 border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-900">Add New Module for Important Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="impModuleNo">Module No.</Label>
                      <Input
                        id="impModuleNo"
                        value={impModuleForm.moduleNo}
                        onChange={(e) => setImpModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                        placeholder="e.g., 1, 2, 3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="impModuleTitle">Module Title</Label>
                      <Input
                        id="impModuleTitle"
                        value={impModuleForm.title}
                        onChange={(e) => setImpModuleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Introduction to Programming"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveImpModule}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Module
                    </Button>
                    <Button
                      onClick={handleCancelImpModuleEdit}
                      variant="outline"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Module Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete module "{deleteModal.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, moduleNo: '', title: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteModule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Confirmation Modal */}
      <Dialog open={deleteQuestionModal.isOpen} onOpenChange={(open) => setDeleteQuestionModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              <br />
              <span className="italic text-sm mt-2 block">"{deleteQuestionModal.question.substring(0, 100)}..."</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestionModal({ isOpen: false, moduleNo: '', questionIndex: -1, question: '', originalQuestion: { question: '', frequency: 1, repetition: 'Most Repeated' } })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Important Questions Module Confirmation Modal */}
      <Dialog open={deleteImpModuleModal.isOpen} onOpenChange={(open) => setDeleteImpModuleModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete module "{deleteImpModuleModal.title}"? This will also delete all questions in this module. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteImpModuleModal({ isOpen: false, moduleNo: '', title: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteImpModule}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 