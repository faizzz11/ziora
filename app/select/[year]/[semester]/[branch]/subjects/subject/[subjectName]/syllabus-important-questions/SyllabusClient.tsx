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
import { Plus, Edit, Trash2, Save, X, BookOpen, Lightbulb, Info, AlertTriangle, FileText, GraduationCap, HelpCircle } from "lucide-react";
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

// Helper function to ensure topics are properly formatted as an array
const formatTopicsAsArray = (topics: string[] | string): string[] => {
  if (Array.isArray(topics)) {
    return topics;
  }
  if (typeof topics === 'string') {
    return topics.split(',').map(topic => topic.trim()).filter(topic => topic.length > 0);
  }
  return [];
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
    // Check if the input contains commas (indicating multiple topics)
    if (value.includes(',')) {
      // Split by commas and clean up each topic
      const splitTopics = value.split(',').map(topic => topic.trim()).filter(topic => topic.length > 0);
      
      if (splitTopics.length > 1) {
        setModuleForm(prev => {
          const newTopics = [...prev.topics];
          
          // Replace the current topic with the first one
          newTopics[index] = splitTopics[0];
          
          // Add the remaining topics as new entries after the current index
          for (let i = 1; i < splitTopics.length; i++) {
            newTopics.splice(index + i, 0, splitTopics[i]);
          }
          
          return { ...prev, topics: newTopics };
        });
        return;
      }
    }
    
    // Normal single topic update
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
        return 'text-foreground'; // One time repeated - Theme aware
    }
  };

  const getFrequencyBadge = (frequency: number, repetition: string) => {
    const colorClasses = {
      1: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-200 dark:border-red-800',
      2: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800', 
      3: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
      4: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-800',
      5: 'bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground border-border'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[frequency as keyof typeof colorClasses] || colorClasses[5]}`}>
        {repetition}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Syllabus & Important Questions
        </h1>
        <p className="text-lg text-muted-foreground">
          Subject: <span className="font-semibold text-foreground">{syllabus.subjectName}</span>
        </p>
      </div>

      {/* Tabs for Syllabus and Important Questions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="syllabus" className="text-lg py-3 flex items-center justify-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Syllabus</span>
          </TabsTrigger>
          <TabsTrigger value="important-questions" className="text-lg py-3 flex items-center justify-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Important Questions</span>
          </TabsTrigger>
        </TabsList>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-8">
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardHeader className="border-b border-border p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground mb-2">
                    {syllabus.subjectName} - Course Syllabus
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total Hours: <span className="font-semibold">{syllabus.totalHours}</span>
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    onClick={handleAddModule}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
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
                  <thead className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b border-border">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-foreground w-20">Module No.</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-foreground w-64">Topics</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-foreground">Details</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-foreground w-20">Hours</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-foreground w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(syllabus.modules || []).map((module, index) => (
                      <tr key={index} className="hover:bg-secondary dark:hover:bg-[oklch(0.205_0_0)] transition-colors">
                        <td className="px-8 py-6 text-sm font-medium text-foreground align-top">
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
                        <td className="px-8 py-6 text-sm font-semibold text-foreground align-top">
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
                        <td className="px-8 py-6 text-sm text-muted-foreground align-top">
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
                              {formatTopicsAsArray(module.topics).map((topic, topicIndex) => (
                                <li key={topicIndex} className="flex items-start">
                                  <span className="text-muted-foreground mr-2">•</span>
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-8 py-6 text-sm font-medium text-foreground align-top text-center">
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
                        <td className="px-8 py-6 text-sm align-top">
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
                  <tfoot className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-t border-border">
                    <tr>
                      <td colSpan={4} className="px-8 py-6 text-sm font-semibold text-foreground text-right">
                        Total:
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-foreground text-center">
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
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border shadow-lg">
              <CardHeader className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b border-border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">Add New Module</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="moduleNo" className="text-foreground font-medium">Module No.</Label>
                    <Input
                      id="moduleNo"
                      value={moduleForm.moduleNo}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                      placeholder="e.g., 1, 2, 3"
                      className="p-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground font-medium">Module Title</Label>
                    <Input
                      id="title"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Introduction to Programming"
                      className="p-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours" className="text-foreground font-medium">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={moduleForm.hours}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="p-3"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-foreground font-medium">Topics</Label>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3 bg-secondary dark:bg-[oklch(0.185_0_0)] border border-border rounded-lg px-4 py-3">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span><strong>Tip:</strong> You can paste multiple topics at once by separating them with commas (e.g., "Topic 1, Topic 2, Topic 3")</span>
                  </div>
                  <div className="space-y-3">
                    {moduleForm.topics.map((topic, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Input
                          value={topic}
                          onChange={(e) => updateTopic(index, e.target.value)}
                          placeholder="Enter topic"
                          className="flex-1 p-3"
                        />
                        <Button
                          onClick={() => removeTopicField(index)}
                          size="sm"
                          variant="outline"
                          disabled={moduleForm.topics.length === 1}
                          className="px-3 py-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={addTopicField}
                      size="sm"
                      variant="outline"
                      className="w-full py-3"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Topic
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleSaveModule}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Module
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="px-6 py-3"
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
        <TabsContent value="important-questions" className="space-y-8">
          {/* Header with Add Module Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Important Questions by Module</h2>
              <p className="text-muted-foreground">Manage modules and their important questions</p>
            </div>
            {isAdmin && (
              <Button
                onClick={handleAddImpModule}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Module</span>
              </Button>
            )}
          </div>

          {/* Legend */}
          <Card className="bg-secondary dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Question Frequency Legend:</h3>
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
                  <span className="text-foreground">One Time Repeated</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg px-3 py-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span><strong>Auto-Sorted:</strong> Questions are automatically arranged by repetition frequency - Most Repeated questions appear first, followed by 2nd Most Repeated, and so on.</span>
              </div>
            </CardContent>
          </Card>

          {/* Important Questions by Module */}
          <div className="space-y-6">
            {(impQuestions.modules || []).map((module, moduleIndex) => (
              <Card key={moduleIndex} className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
                <CardHeader className="border-b border-border bg-secondary dark:bg-[oklch(0.205_0_0)]">
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
                        <CardTitle className="text-lg font-semibold text-foreground">
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
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-card dark:bg-[oklch(0.205_0_0)] border border-border rounded-r-lg">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="newQuestion" className="text-foreground">New Question</Label>
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
                            <Label htmlFor="newRepetition" className="text-foreground">Repetition Type</Label>
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
              <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border shadow-lg">
                <CardHeader className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b border-border p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-full flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">Add New Module for Important Questions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="impModuleNo" className="text-foreground font-medium">Module No.</Label>
                      <Input
                        id="impModuleNo"
                        value={impModuleForm.moduleNo}
                        onChange={(e) => setImpModuleForm(prev => ({ ...prev, moduleNo: e.target.value }))}
                        placeholder="e.g., 1, 2, 3"
                        className="p-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="impModuleTitle" className="text-foreground font-medium">Module Title</Label>
                      <Input
                        id="impModuleTitle"
                        value={impModuleForm.title}
                        onChange={(e) => setImpModuleForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Introduction to Programming"
                        className="p-3"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={handleSaveImpModule}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Module
                    </Button>
                    <Button
                      onClick={handleCancelImpModuleEdit}
                      variant="outline"
                      className="px-6 py-3"
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
        <DialogContent className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border max-w-md p-8">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-full flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-muted-foreground" />
            </div>
            <DialogTitle className="text-foreground text-xl font-semibold">Delete Module</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm space-y-2">
              <div>Are you sure you want to delete module <span className="font-semibold text-foreground">"{deleteModal.title}"</span>?</div>
              <div className="text-muted-foreground">This action cannot be undone.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ isOpen: false, moduleNo: '', title: '' })}
              className="flex-1 px-4 py-3"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteModule}
              className="flex-1 px-4 py-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Question Confirmation Modal */}
      <Dialog open={deleteQuestionModal.isOpen} onOpenChange={(open) => setDeleteQuestionModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border max-w-lg p-8">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-full flex items-center justify-center">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <DialogTitle className="text-foreground text-xl font-semibold">Delete Question</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm space-y-3">
              <div>Are you sure you want to delete this question?</div>
              <div className="bg-secondary dark:bg-[oklch(0.185_0_0)] p-4 rounded-lg border border-border">
                <span className="italic text-xs text-foreground">"{deleteQuestionModal.question.substring(0, 150)}..."</span>
              </div>
              <div className="text-muted-foreground">This action cannot be undone.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteQuestionModal({ isOpen: false, moduleNo: '', questionIndex: -1, question: '', originalQuestion: { question: '', frequency: 1, repetition: 'Most Repeated' } })}
              className="flex-1 px-4 py-3"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteQuestion}
              className="flex-1 px-4 py-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Important Questions Module Confirmation Modal */}
      <Dialog open={deleteImpModuleModal.isOpen} onOpenChange={(open) => setDeleteImpModuleModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border max-w-md p-8">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-full flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-muted-foreground" />
            </div>
            <DialogTitle className="text-foreground text-xl font-semibold">Delete Module</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm space-y-3">
              <div>Are you sure you want to delete module <span className="font-semibold text-foreground">"{deleteImpModuleModal.title}"</span>?</div>
              <div className="bg-secondary dark:bg-[oklch(0.185_0_0)] border border-border p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">This will also delete all questions in this module.</span>
                </div>
              </div>
              <div className="text-muted-foreground">This action cannot be undone.</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteImpModuleModal({ isOpen: false, moduleNo: '', title: '' })}
              className="flex-1 px-4 py-3"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteImpModule}
              className="flex-1 px-4 py-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 