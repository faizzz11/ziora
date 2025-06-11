'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, MessageCircle, Search, BookOpen, ArrowLeft, Home, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import branchSubjectsData from '@/data/branch-subjects.json';

interface VivaQuestionsPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

// Initial sample viva questions data
const initialVivaQuestions: VivaQuestion[] = [
  {
    id: '1',
    question: "What is Object-Oriented Programming?",
    answer: "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of objects, which contain data (attributes) and code (methods). The main principles of OOP are encapsulation, inheritance, polymorphism, and abstraction.",
    category: "Fundamentals",
    difficulty: "Basic"
  },
  {
    id: '2',
    question: "Explain the difference between a class and an object.",
    answer: "A class is a blueprint or template that defines the structure and behavior of objects. An object is an instance of a class that has actual values for the attributes defined in the class. For example, 'Car' is a class, while 'my red Toyota' is an object of the Car class.",
    category: "OOP Concepts",
    difficulty: "Basic"
  },
  {
    id: '3',
    question: "What is encapsulation and why is it important?",
    answer: "Encapsulation is the bundling of data and methods that operate on that data within a single unit (class). It restricts direct access to some of the object's components, which is a means of preventing accidental interference and misuse. It provides data hiding and increases security.",
    category: "OOP Concepts",
    difficulty: "Intermediate"
  },
  {
    id: '4',
    question: "Explain inheritance with an example.",
    answer: "Inheritance is a mechanism where a new class (child/derived class) inherits properties and methods from an existing class (parent/base class). For example, a 'Student' class can inherit from a 'Person' class, gaining access to name, age properties while adding student-specific properties like studentID, course.",
    category: "OOP Concepts",
    difficulty: "Intermediate"
  },
  {
    id: '5',
    question: "What is polymorphism? Give an example.",
    answer: "Polymorphism allows objects of different types to be treated as objects of a common base type. It enables a single interface to represent different underlying forms. For example, a 'draw()' method can behave differently for Circle, Rectangle, and Triangle objects, but all can be called using the same interface.",
    category: "OOP Concepts",
    difficulty: "Intermediate"
  },
  {
    id: '6',
    question: "What is abstraction in programming?",
    answer: "Abstraction is the process of hiding complex implementation details while showing only essential features of an object. It helps in reducing programming complexity and effort. Abstract classes and interfaces are used to achieve abstraction.",
    category: "OOP Concepts",
    difficulty: "Intermediate"
  },
  {
    id: '7',
    question: "Explain the difference between method overloading and method overriding.",
    answer: "Method overloading occurs when multiple methods have the same name but different parameters within the same class. Method overriding occurs when a subclass provides a specific implementation of a method already defined in its parent class. Overloading is compile-time polymorphism, while overriding is runtime polymorphism.",
    category: "Advanced Concepts",
    difficulty: "Advanced"
  },
  {
    id: '8',
    question: "What is a constructor? What are different types of constructors?",
    answer: "A constructor is a special method that is automatically called when an object is created. Types include: Default constructor (no parameters), Parameterized constructor (takes parameters), Copy constructor (creates object from another object), and Static constructor (initializes static members).",
    category: "OOP Concepts",
    difficulty: "Basic"
  },
  {
    id: '9',
    question: "What is the difference between abstract class and interface?",
    answer: "Abstract class can have both abstract and concrete methods, can have instance variables, and supports single inheritance. Interface can only have abstract methods (in traditional sense), cannot have instance variables, and supports multiple inheritance. Abstract classes represent 'is-a' relationship while interfaces represent 'can-do' relationship.",
    category: "Advanced Concepts",
    difficulty: "Advanced"
  },
  {
    id: '10',
    question: "Explain the concept of data hiding.",
    answer: "Data hiding is a software development technique to prevent access to object implementation details. It's achieved through access modifiers like private, protected, and public. Private members are hidden from outside access, ensuring data integrity and security.",
    category: "OOP Concepts",
    difficulty: "Basic"
  }
];

const defaultCategories = ['Fundamentals', 'OOP Concepts', 'Advanced Concepts', 'Design Patterns', 'Memory Management', 'Error Handling'];
const difficulties = ['Basic', 'Intermediate', 'Advanced'];

export default function VivaQuestionsPage({ params }: VivaQuestionsPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [vivaQuestions, setVivaQuestions] = useState<VivaQuestion[]>(initialVivaQuestions);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
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
  
  const [questionForm, setQuestionForm] = useState({
    question: '',
    answer: '',
    category: 'Fundamentals',
    difficulty: 'Basic'
  });

  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Combine default and custom categories
  const allCategories = ['All', ...defaultCategories, ...customCategories];
  const categories = [...defaultCategories, ...customCategories];

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

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

  const handleSaveQuestion = () => {
    if (!questionForm.question.trim() || !questionForm.answer.trim()) {
      toast.error("Please fill in both question and answer fields");
      return;
    }

    if (editingQuestionId) {
      // Update existing question
      setVivaQuestions(prev => 
        prev.map(q => 
          q.id === editingQuestionId ? { ...q, ...questionForm } : q
        )
      );
      toast.success("Question updated successfully");
      setEditingQuestionId(null);
    } else {
      // Add new question
      const newQuestion: VivaQuestion = {
        id: Date.now().toString(),
        ...questionForm
      };
      setVivaQuestions(prev => [...prev, newQuestion]);
      toast.success("Question added successfully");
      setIsAddingQuestion(false);
    }

    setQuestionForm({
      question: '',
      answer: '',
      category: 'Fundamentals',
      difficulty: 'Basic'
    });
  };

  const handleDeleteQuestion = (question: VivaQuestion) => {
    setDeleteModal({
      isOpen: true,
      id: question.id,
      question: question.question
    });
  };

  const confirmDelete = () => {
    setVivaQuestions(prev => prev.filter(q => q.id !== deleteModal.id));
    toast.success("Question deleted successfully");
    setDeleteModal({ isOpen: false, id: '', question: '' });
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

  if (isLoading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get subject info from branch subjects data
  const { branches } = branchSubjectsData;
  const branchKey = resolvedParams.year === 'first-year' ? 'first-year' : resolvedParams.branch;
  const selectedBranchData = (branches as any)[branchKey];
  const semesterSubjects = selectedBranchData?.semesters[resolvedParams.semester] || [];
  const subject = semesterSubjects.find((s: any) => s.id === resolvedParams.subjectName) || {
    id: resolvedParams.subjectName,
    name: resolvedParams.subjectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Study materials for ${resolvedParams.subjectName}`,
    icon: '📚',
    code: 'N/A',
    credits: 3
  };

  const backUrl = `/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects/subject/${resolvedParams.subjectName}`;

  // Filter questions based on search and filters
  // Add new category function
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

  const filteredQuestions = vivaQuestions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const allDifficulties = ['All', ...difficulties];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fundamentals': return 'bg-blue-100 text-blue-800';
      case 'OOP Concepts': return 'bg-purple-100 text-purple-800';
      case 'Advanced Concepts': return 'bg-indigo-100 text-indigo-800';
      case 'Design Patterns': return 'bg-pink-100 text-pink-800';
      case 'Memory Management': return 'bg-orange-100 text-orange-800';
      case 'Error Handling': return 'bg-cyan-100 text-cyan-800';
      default: 
        // For custom categories, use a different color scheme
        return customCategories.includes(category) 
          ? 'bg-emerald-100 text-emerald-800' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/select" className="hover:text-gray-900 transition-colors font-medium">Academic Years</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects`} className="hover:text-gray-900 transition-colors font-medium">Subjects</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={backUrl} className="hover:text-gray-900 transition-colors font-medium">
              {subject.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Viva Questions</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-900">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Viva Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Comprehensive collection of viva voce questions and answers for <span className="font-semibold">{subject.name}</span>
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
            <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium">
              {vivaQuestions.length} Questions
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium">
              {categories.length} Categories
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium">
              Multiple Difficulty Levels
            </Badge>
          </div>

          {/* Add Question Button */}
          <Button
            onClick={handleAddQuestion}
            className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Question
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                {allCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                {allDifficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredQuestions.length} of {vivaQuestions.length} questions
          </p>
        </div>

        {/* Questions Grid */}
        <div className="space-y-6">
          {filteredQuestions.map((question, index) => (
            <Card key={question.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
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
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
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
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">{question.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results message */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href={backUrl}>
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subject
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
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
    </div>
  );
}
