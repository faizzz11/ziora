'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Search, ArrowLeft, Home, Plus, Edit, Trash2, Save, X, Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface VivaData {
  questions: VivaQuestion[];
  categories: string[];
}

interface VivaQuestionsClientProps {
  subject: Subject;
  vivaData: VivaData;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

const difficulties = ['Basic', 'Intermediate', 'Advanced'];

// API helper functions
const saveVivaQuestionsToAPI = async (year: string, semester: string, branch: string, subjectName: string, vivaData: VivaData) => {
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
        contentType: 'viva-questions',
        content: vivaData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save viva questions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving viva questions:', error);
    throw error;
  }
};

export default function VivaQuestionsClient({ subject, vivaData, subjectName, year, semester, branch }: VivaQuestionsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>(vivaData.questions);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  React.useEffect(() => {
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
  
  // CRUD States
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    question: string;
  }>({
    isOpen: false,
    id: '',
    question: ''
  });
  
  // Bulk Import States
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [importPreview, setImportPreview] = useState<VivaQuestion[]>([]);
  const [importMode, setImportMode] = useState<'text' | 'file'>('text');
  const [showValidationError, setShowValidationError] = useState(false);
  
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    category: 'Fundamentals',
    difficulty: 'Basic'
  });

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Combine default and custom categories
  const defaultCategories = vivaData.categories || ['Fundamentals', 'OOP Concepts', 'Advanced Concepts'];
  const allCategories = ['All', ...defaultCategories, ...customCategories];
  const categories = [...defaultCategories, ...customCategories];

  // Filter questions based on search and filters
  const filteredQuestions = vivaQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const allDifficulties = ['All', ...difficulties];

  // Bulk Import Functions
  const validateAndParseJSON = (jsonText: string): VivaQuestion[] | null => {
    // Return null for empty or clearly incomplete JSON
    const trimmed = jsonText.trim();
    if (!trimmed) return null;
    
    // Check for obviously incomplete JSON (common typing patterns)
    const incompletePatterns = [
      /^[\{\[]$/,           // Just opening brace/bracket
      /^[\{\[][\s]*$/,      // Opening brace/bracket with whitespace
      /^\{[\s]*"[\w]*$/,    // Incomplete property name
      /^\[[\s]*\{[\s]*$/,   // Array with incomplete object
    ];
    
    if (incompletePatterns.some(pattern => pattern.test(trimmed))) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed);
      
      // Handle different JSON formats
      let questions: any[] = [];
      
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else if (typeof parsed === 'object' && parsed.question && parsed.answer) {
        questions = [parsed];
      } else {
        // Don't throw error for valid JSON that's just not in expected format
        // This could be the user is still typing
        return null;
      }

      // Validate each question
      const validatedQuestions: VivaQuestion[] = questions.map((q, index) => {
        if (!q.question || !q.answer) {
          throw new Error(`Question ${index + 1} is missing required fields (question, answer)`);
        }
        
        return {
          id: q.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          question: q.question.toString().trim(),
          answer: q.answer.toString().trim(),
          category: q.category || 'Fundamentals',
          difficulty: q.difficulty || 'Basic'
        };
      });

      return validatedQuestions;
    } catch (error) {
      // Only log actual parsing errors, not expected incomplete JSON
      if (error instanceof SyntaxError && (
        error.message.includes('Unexpected end of JSON input') ||
        error.message.includes('Unexpected non-whitespace character')
      )) {
        // These are expected while typing, don't log as errors
        return null;
      }
      
      console.error('JSON validation error:', error);
      return null;
    }
  };

  const handleBulkImportTextChange = (text: string) => {
    setBulkImportText(text);
    setShowValidationError(false); // Reset error state on new input
    
    if (text.trim()) {
      const parsed = validateAndParseJSON(text);
      if (parsed && parsed.length > 0) {
        setImportPreview(parsed);
        setShowValidationError(false);
      } else {
        setImportPreview([]);
        
        // Only show validation error after user has stopped typing for a bit
        // and the text looks like it should be complete JSON
        const trimmed = text.trim();
        if (trimmed.length > 10 && 
            (trimmed.endsWith('}') || trimmed.endsWith(']')) &&
            (trimmed.startsWith('{') || trimmed.startsWith('['))) {
          // Delay showing error to avoid interrupting typing
          setTimeout(() => {
            if (bulkImportText === text) { // Only show if text hasn't changed
              setShowValidationError(true);
            }
          }, 1000);
        }
      }
    } else {
      setImportPreview([]);
      setShowValidationError(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBulkImportText(content);
      setShowValidationError(false);
      handleBulkImportTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (importPreview.length === 0) {
      toast.error('No valid questions to import');
      return;
    }

    try {
      // Add unique IDs and ensure no duplicates
      const newQuestions = importPreview.map(q => ({
        ...q,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));

      const updatedQuestions = [...vivaQuestions, ...newQuestions];
      setVivaQuestions(updatedQuestions);

      // Extract and add new categories
      const newCategories = [...new Set(newQuestions.map(q => q.category))];
      const uniqueNewCategories = newCategories.filter(cat => 
        !categories.includes(cat) && !customCategories.includes(cat)
      );
      
      if (uniqueNewCategories.length > 0) {
        setCustomCategories(prev => [...prev, ...uniqueNewCategories]);
      }

      // Save to API
      await saveVivaQuestionsToAPI(year, semester, branch, subjectName, {
        questions: updatedQuestions,
        categories: [...categories, ...customCategories, ...uniqueNewCategories]
      });

      toast.success(`Successfully imported ${newQuestions.length} questions`);
      setIsBulkImporting(false);
      setBulkImportText('');
      setImportPreview([]);
      setShowValidationError(false);
    } catch (error) {
      console.error('Error importing questions:', error);
      toast.error('Failed to import questions');
    }
  };

  const resetBulkImport = () => {
    setBulkImportText('');
    setImportPreview([]);
    setImportMode('text');
    setShowValidationError(false);
  };

  // CRUD Functions
  const handleAddQuestion = () => {
    setIsAddingQuestion(true);
    setQuestionForm({
      question: '',
      answer: '',
      category: 'Fundamentals',
      difficulty: 'Basic'
    });
  };

  const handleEditQuestion = (question: VivaQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      question: question.question,
      answer: question.answer,
      category: question.category,
      difficulty: question.difficulty
    });
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question.trim() || !questionForm.answer.trim()) {
      toast.error("Please fill in both question and answer fields");
      return;
    }

    try {
      let updatedQuestions: VivaQuestion[];

      if (editingQuestionId) {
        // Update existing question
        updatedQuestions = vivaQuestions.map(q => 
          q.id === editingQuestionId ? { ...q, ...questionForm } : q
        );
        toast.success("Question updated successfully");
        setEditingQuestionId(null);
      } else {
        // Add new question
        const newQuestion: VivaQuestion = {
          id: Date.now().toString(),
          ...questionForm
        };
        updatedQuestions = [...vivaQuestions, newQuestion];
        toast.success("Question added successfully");
        setIsAddingQuestion(false);
      }

      setVivaQuestions(updatedQuestions);

      // Save to API
      await saveVivaQuestionsToAPI(year, semester, branch, subjectName, {
        questions: updatedQuestions,
        categories: categories
      });

      setQuestionForm({
        question: '',
        answer: '',
        category: 'Fundamentals',
        difficulty: 'Basic'
      });

    } catch (error) {
      console.error('Error saving question:', error);
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = (question: VivaQuestion) => {
    setDeleteModal({
      isOpen: true,
      id: question.id,
      question: question.question
    });
  };

  const confirmDelete = async () => {
    try {
      const updatedQuestions = vivaQuestions.filter(q => q.id !== deleteModal.id);
      setVivaQuestions(updatedQuestions);

      // Save to API
      await saveVivaQuestionsToAPI(year, semester, branch, subjectName, {
        questions: updatedQuestions,
        categories: categories
      });

      toast.success("Question deleted successfully");
      setDeleteModal({ isOpen: false, id: '', question: '' });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error("Failed to delete question");
    }
  };

  const cancelEdit = () => {
    setEditingQuestionId(null);
    setIsAddingQuestion(false);
    setQuestionForm({
      question: '',
      answer: '',
      category: 'Fundamentals',
      difficulty: 'Basic'
    });
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCustomCategories(prev => [...prev, newCategoryName.trim()]);
      setQuestionForm({ ...questionForm, category: newCategoryName.trim() });
      setNewCategoryName('');
      setIsAddingNewCategory(false);
      toast.success(`Category "${newCategoryName.trim()}" added successfully`);
    } else {
      toast.error("Category name is empty or already exists");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'Advanced': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default: return 'bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fundamentals': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'OOP Concepts': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
      case 'Advanced Concepts': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100';
      case 'Design Patterns': return 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100';
      case 'Memory Management': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100';
      case 'Error Handling': return 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-100';
      default: 
        return customCategories.includes(category) 
          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100' 
          : 'bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground';
    }
  };

  const backUrl = `/select/${year}/${semester}/${branch}/subjects/subject/${subjectName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/60">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Viva Questions
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          Comprehensive collection of viva voce questions and answers for <span className="font-semibold text-foreground">{subject.name}</span>
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <Badge className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground px-4 py-2 text-sm font-medium">
            {vivaQuestions.length} Questions
          </Badge>
          <Badge className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground px-4 py-2 text-sm font-medium">
            {categories.length} Categories
          </Badge>
          <Badge className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground px-4 py-2 text-sm font-medium">
            Multiple Difficulty Levels
          </Badge>
        </div>

        {/* Add Question Buttons - Only show for admins */}
        {isAdmin && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleAddQuestion}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3 rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Question
            </Button>
            <Button
              onClick={() => setIsBulkImporting(true)}
              variant="outline"
              className="px-6 py-3 rounded-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background dark:bg-[oklch(0.205_0_0)] border-border"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background dark:bg-[oklch(0.205_0_0)] text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background dark:bg-[oklch(0.205_0_0)] text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {allDifficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <p className="text-sm text-muted-foreground mt-4">
          Showing {filteredQuestions.length} of {vivaQuestions.length} questions
        </p>
      </div>

      {/* Questions Grid */}
      <div className="space-y-6">
        {filteredQuestions.map((question, index) => (
          <Card key={question.id} className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingQuestionId === question.id ? (
                    <div className="space-y-4">
                      <Input
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="Enter question..."
                        className="text-lg font-semibold"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-lg font-semibold text-foreground mb-2">
                      Q{index + 1}. {question.question}
                    </CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {editingQuestionId === question.id ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveQuestion}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditQuestion(question)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuestion(question)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  )}
                  <Badge className={getCategoryColor(question.category)}>
                    {question.category}
                  </Badge>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {editingQuestionId === question.id ? (
                <div className="space-y-4">
                  <Textarea
                    value={questionForm.answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                    placeholder="Enter answer..."
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <select
                      value={questionForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                          setIsAddingNewCategory(true);
                        } else {
                          setQuestionForm({ ...questionForm, category: e.target.value });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map((category: string) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                      <option value="ADD_NEW">+ Add New Category</option>
                    </select>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>
                  
                  {isAddingNewCategory && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewCategory();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddNewCategory}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryName('');
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{question.answer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No questions found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-center gap-4 mt-12">
        <Link href={backUrl}>
          <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-secondary dark:hover:bg-[oklch(0.205_0_0)] transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subject
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-secondary dark:hover:bg-[oklch(0.205_0_0)] transition-all duration-300">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
            <DialogDescription>
              Create a new viva question with answer and tags.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder="Enter the question..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={questionForm.answer}
                onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                placeholder="Enter the answer..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <div className="space-y-2">
                  <select
                    id="category"
                    value={questionForm.category}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setIsAddingNewCategory(true);
                      } else {
                        setQuestionForm({ ...questionForm, category: e.target.value });
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent w-full"
                  >
                    {categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="ADD_NEW">+ Add New Category</option>
                  </select>
                  
                  {isAddingNewCategory && (
                    <div className="flex gap-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewCategory();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddNewCategory}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryName('');
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={questionForm.difficulty}
                  onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} className="bg-gray-900 hover:bg-gray-800">
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => {
        if (!open) setDeleteModal({ isOpen: false, id: '', question: '' });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              "{deleteModal.question}"
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: '', question: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImporting} onOpenChange={setIsBulkImporting}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>
              Import multiple questions at once using JSON format. You can paste JSON text or upload a JSON file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Import Mode Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <Button
                size="sm"
                variant={importMode === 'text' ? 'default' : 'ghost'}
                onClick={() => setImportMode('text')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Text Input
              </Button>
              <Button
                size="sm"
                variant={importMode === 'file' ? 'default' : 'ghost'}
                onClick={() => setImportMode('file')}
              >
                <Upload className="w-4 h-4 mr-1" />
                File Upload
              </Button>
            </div>

            {/* File Upload Mode */}
            {importMode === 'file' && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a JSON file containing questions
                </p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}

            {/* Text Input Mode */}
            {importMode === 'text' && (
              <div className="space-y-2">
                <Label>JSON Input</Label>
                <Textarea
                  value={bulkImportText}
                  onChange={(e) => handleBulkImportTextChange(e.target.value)}
                  placeholder={`Paste your JSON here. Supported formats:

1. Array of questions:
[
  {
    "question": "What is OOP?",
    "answer": "Object-Oriented Programming...",
    "category": "Fundamentals",
    "difficulty": "Basic"
  }
]

2. Object with questions array:
{
  "questions": [
    {
      "question": "What is inheritance?",
      "answer": "Inheritance is...",
      "category": "OOP Concepts",
      "difficulty": "Intermediate"
    }
  ]
}

3. Single question object:
{
  "question": "What is polymorphism?",
  "answer": "Polymorphism is...",
  "category": "OOP Concepts",
  "difficulty": "Advanced"
}`}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <Label>Preview ({importPreview.length} questions)</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {importPreview.map((question, index) => (
                    <div key={index} className="border rounded p-3 bg-muted/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">Q{index + 1}: {question.question}</h4>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {question.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {question.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {showValidationError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                Invalid JSON format. Please check your input and try again. Make sure your JSON is properly formatted with matching braces and quotes.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBulkImporting(false);
              resetBulkImport();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkImport}
              disabled={importPreview.length === 0}
              className="bg-gray-900 hover:bg-gray-800"
            >
              Import {importPreview.length} Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 