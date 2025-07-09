'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import PDFViewer from "@/components/PDFViewer";
import GitHubUploader from "@/components/GitHubUploader";

interface GitHubFile {
  name: string;
  path: string;
  downloadUrl: string;
  size: number;
  gitHubUrl: string;
}

interface Paper {
  id: string;
  title: string;
  year: string;
  month: string;
  githubFiles?: GitHubFile[];
  selectedGitHubFile?: string; // URL of selected GitHub file
}

interface SubjectPYQ {
  subjectName: string;
  papers: Paper[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  materials: string;
  color: string;
}

interface PYQClientProps {
  subject: Subject;
  subjectPYQ: SubjectPYQ;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

// API helper functions
const savePaperToAPI = async (year: string, semester: string, branch: string, subjectName: string, papers: Paper[]) => {
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
        contentType: 'pyq',
        content: { papers },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving paper:', error);
    throw error;
  }
};

const updatePaperInAPI = async (year: string, semester: string, branch: string, subjectName: string, papers: Paper[]) => {
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
        contentType: 'pyq',
        content: { papers },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating paper:', error);
    throw error;
  }
};

export default function PYQClient({ subject, subjectPYQ, subjectName, year, semester, branch }: PYQClientProps) {
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [papers, setPapers] = useState<Paper[]>(subjectPYQ?.papers || []);
  const [editingPaper, setEditingPaper] = useState<string | null>(null);
  const [editPaperData, setEditPaperData] = useState({
    title: '',
    year: '',
    month: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: ''
  });

  // GitHub uploader state
  const [showGitHubUploader, setShowGitHubUploader] = useState(false);
  const [currentPaperForUpload, setCurrentPaperForUpload] = useState<string | null>(null);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check for admin status from localStorage
    const adminData = localStorage.getItem('admin');
    const userData = localStorage.getItem('user');

    if (adminData) {
      const admin = JSON.parse(adminData);
      setIsAdmin(admin.role === 'admin' || admin.isAdmin === true);
      setCurrentUser(admin);
    } else if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
      setCurrentUser(user);
    }
  }, []);

  // Set first paper as current when papers load
  useEffect(() => {
    if (papers.length > 0 && !currentPaper) {
      setCurrentPaper(papers[0]);
      setSelectedPaper(papers[0].id);
    }
  }, [papers, currentPaper]);

  const handlePaperChange = (paper: Paper) => {
    setCurrentPaper(paper);
    setSelectedPaper(paper.id);
  };

  const handlePreviousPaper = () => {
    if (!currentPaper) return;
    const currentIndex = papers.findIndex(p => p.id === currentPaper.id);
    if (currentIndex > 0) {
      const previousPaper = papers[currentIndex - 1];
      setCurrentPaper(previousPaper);
      setSelectedPaper(previousPaper.id);
    }
  };

  const handleNextPaper = () => {
    if (!currentPaper) return;
    const currentIndex = papers.findIndex(p => p.id === currentPaper.id);
    if (currentIndex < papers.length - 1) {
      const nextPaper = papers[currentIndex + 1];
      setCurrentPaper(nextPaper);
      setSelectedPaper(nextPaper.id);
    }
  };

  const previousPaper = currentPaper ? papers[papers.findIndex(p => p.id === currentPaper.id) - 1] : null;
  const nextPaper = currentPaper ? papers[papers.findIndex(p => p.id === currentPaper.id) + 1] : null;

  const handleAddPaper = async () => {
    const newPaper: Paper = {
      id: `paper-${Date.now()}`,
      title: 'New Question Paper',
      year: '2024',
      month: 'May',
      githubFiles: [],
      selectedGitHubFile: undefined
    };

    const updatedPapers = [...papers, newPaper];
    setPapers(updatedPapers);
    setCurrentPaper(newPaper);
    setSelectedPaper(newPaper.id);

    // Save to API
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
    } catch (error) {
      console.error('Error adding paper:', error);
      // Revert on error
      setPapers(papers);
    }
  };

  const handleEditPaper = (paperId: string, currentTitle: string, currentYear: string, currentMonth: string) => {
    setEditingPaper(paperId);
    setEditPaperData({
      title: currentTitle,
      year: currentYear,
      month: currentMonth
    });
  };

  const handleSavePaper = async (paperId: string) => {
    const updatedPapers = papers.map(paper =>
      paper.id === paperId
        ? {
          ...paper,
          title: editPaperData.title,
          year: editPaperData.year,
          month: editPaperData.month
        }
        : paper
    );

    setPapers(updatedPapers);

    // Update current paper if it's the one being edited
    if (currentPaper?.id === paperId) {
      setCurrentPaper(prev => prev ? {
        ...prev,
        title: editPaperData.title,
        year: editPaperData.year,
        month: editPaperData.month
      } : null);
    }

    setEditingPaper(null);

    // Save to API
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
    } catch (error) {
      console.error('Error saving paper:', error);
      // Revert on error
      setPapers(papers);
      if (currentPaper?.id === paperId) {
        setCurrentPaper(currentPaper);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPaper(null);
  };

  const handleDeletePaper = (paperId: string) => {
    const paper = papers.find(p => p.id === paperId);
    if (paper) {
      setDeleteModal({
        isOpen: true,
        id: paperId,
        title: paper.title
      });
    }
  };

  const confirmDeletePaper = async (paperId: string) => {
    const updatedPapers = papers.filter(paper => paper.id !== paperId);
    setPapers(updatedPapers);

    // If we deleted the current paper, select the first available one
    if (currentPaper?.id === paperId) {
      if (updatedPapers.length > 0) {
        setCurrentPaper(updatedPapers[0]);
        setSelectedPaper(updatedPapers[0].id);
      } else {
        setCurrentPaper(null);
        setSelectedPaper('');
      }
    }

    setDeleteModal({ isOpen: false, id: '', title: '' });

    // Save to API
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
    } catch (error) {
      console.error('Error deleting paper:', error);
      // Revert on error
      setPapers(papers);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: '', title: '' });
  };

  const handleGitHubFileUploaded = async (file: GitHubFile) => {
    if (!currentPaperForUpload) return;

    const updatedPapers = papers.map(paper =>
      paper.id === currentPaperForUpload
        ? {
          ...paper,
          githubFiles: [...(paper.githubFiles || []), file],
          selectedGitHubFile: file.downloadUrl // Auto-select the newly uploaded file
        }
        : paper
    );

    setPapers(updatedPapers);

    // Update current paper if it's the one being updated
    if (currentPaper?.id === currentPaperForUpload) {
      setCurrentPaper(prev => prev ? {
        ...prev,
        githubFiles: [...(prev.githubFiles || []), file],
        selectedGitHubFile: file.downloadUrl
      } : null);
    }

    // Save to MongoDB
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);

      // Show success toast
      showToast('PDF uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error saving GitHub file upload to MongoDB:', error);
    }
  };

  const handleGitHubFileSelected = async (file: GitHubFile) => {
    if (!currentPaperForUpload) return;

    const updatedPapers = papers.map(paper =>
      paper.id === currentPaperForUpload
        ? { ...paper, selectedGitHubFile: file.downloadUrl }
        : paper
    );

    setPapers(updatedPapers);

    // Update current paper if it's the one being updated
    if (currentPaper?.id === currentPaperForUpload) {
      setCurrentPaper(prev => prev ? {
        ...prev,
        selectedGitHubFile: file.downloadUrl
      } : null);
    }

    // Save to MongoDB
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
    } catch (error) {
      console.error('Error saving GitHub file selection to MongoDB:', error);
    }
  };

  const handleGitHubFileDeleted = async (fileName: string) => {
    if (!currentPaperForUpload) return;

    const updatedPapers = papers.map(paper =>
      paper.id === currentPaperForUpload
        ? {
          ...paper,
          githubFiles: (paper.githubFiles || []).filter(f => f.name !== fileName),
          selectedGitHubFile: paper.selectedGitHubFile &&
            (paper.githubFiles || []).find(f => f.downloadUrl === paper.selectedGitHubFile)?.name === fileName
            ? undefined
            : paper.selectedGitHubFile
        }
        : paper
    );

    setPapers(updatedPapers);

    // Update current paper if it's the one being updated
    if (currentPaper?.id === currentPaperForUpload) {
      const updatedFiles = (currentPaper.githubFiles || []).filter(f => f.name !== fileName);
      const shouldClearSelected = currentPaper.selectedGitHubFile &&
        (currentPaper.githubFiles || []).find(f => f.downloadUrl === currentPaper.selectedGitHubFile)?.name === fileName;

      setCurrentPaper(prev => prev ? {
        ...prev,
        githubFiles: updatedFiles,
        selectedGitHubFile: shouldClearSelected ? undefined : prev.selectedGitHubFile
      } : null);
    }

    // Save to MongoDB
    try {
      await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
    } catch (error) {
      console.error('Error saving GitHub file deletion to MongoDB:', error);
    }
  };

  const openGitHubUploader = (paperId: string) => {
    setCurrentPaperForUpload(paperId);
    setShowGitHubUploader(true);
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-opacity duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <section className="bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePreviousPaper}
              disabled={!previousPaper}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Paper</span>
            </Button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {currentPaper ? `${currentPaper.month} ${currentPaper.year} - ${currentPaper.title}` : 'Select a paper'}
              </h1>
            </div>

            <Button
              variant="outline"
              onClick={handleNextPaper}
              disabled={!nextPaper}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <span>Next Paper</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && currentPaper && (
              <Button
                onClick={() => openGitHubUploader(currentPaper.id)}
                className="cursor-pointer bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload PDFs
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* PDF Viewer Section */}
          <div className="xl:col-span-2 space-y-6">

            {/* PDF Tab - PDF Viewer */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-0">
                {currentPaper ? (
                  <div>
                    {/* PDF Header */}
                    <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b border-border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-lg font-semibold text-foreground">
                            {currentPaper.month} {currentPaper.year} - Previous Year Questions
                          </h2>
                          {currentPaper.selectedGitHubFile && (
                            <Badge variant="secondary" className="text-xs">
                              {currentPaper.githubFiles?.find(f => f.downloadUrl === currentPaper.selectedGitHubFile)?.name}
                            </Badge>
                          )}
                        </div>
                        {isAdmin && (
                          <Button
                            onClick={() => openGitHubUploader(currentPaper.id)}
                            size="sm"
                            variant="outline"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload PDFs
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* PDF Display */}
                    <div style={{ height: '70vh' }}>
                      {currentPaper.selectedGitHubFile ? (
                        <PDFViewer
                          url={currentPaper.selectedGitHubFile}
                          title={`${currentPaper.month} ${currentPaper.year} - PDF`}
                          height="70vh"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary dark:bg-[oklch(0.205_0_0)]">
                          <div className="text-center p-8">
                            <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                              No PDF Selected
                            </h3>
                            <p className="text-muted-foreground">
                              {(currentPaper.githubFiles || []).length > 0
                                ? 'Choose a PDF from the sidebar to view the question paper.'
                                : 'No PDFs uploaded yet for this paper.'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-secondary dark:bg-[oklch(0.205_0_0)]">
                    <div className="text-center p-8">
                      <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No Papers Available
                      </h3>
                      <p className="text-muted-foreground">
                        {isAdmin ? 'Add question papers to get started.' : 'No question papers have been uploaded yet.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Papers */}
          <div className="xl:col-span-1">
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Question Papers</h3>

                <div className="space-y-3">
                  {papers.map((paper) => (
                    <div key={paper.id}>
                      <button
                        onClick={() => setSelectedPaper(selectedPaper === paper.id ? '' : paper.id)}
                        className="cursor-pointer w-full text-left p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] hover:bg-muted dark:hover:bg-[oklch(0.225_0_0)] rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{paper.month} {paper.year}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${selectedPaper === paper.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {selectedPaper === paper.id && (
                        <div className="mt-2 space-y-2">
                          <div className="p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-lg border">
                            {editingPaper === paper.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={editPaperData.title}
                                    onChange={(e) => setEditPaperData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Paper title"
                                    autoFocus
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
                                  <input
                                    type="text"
                                    value={editPaperData.year}
                                    onChange={(e) => setEditPaperData(prev => ({ ...prev, year: e.target.value }))}
                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2024"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Month</label>
                                  <input
                                    type="text"
                                    value={editPaperData.month}
                                    onChange={(e) => setEditPaperData(prev => ({ ...prev, month: e.target.value }))}
                                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="May"
                                  />
                                </div>
                                {/* GitHub PDF Management in Edit Mode */}
                                {isAdmin && (
                                  <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">PDF Files</label>
                                    <Button
                                      onClick={() => openGitHubUploader(paper.id)}
                                      size="sm"
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      Upload PDFs
                                    </Button>
                                  </div>
                                )}
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleSavePaper(paper.id)}
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
                                  <span className="text-sm font-medium text-muted-foreground">Paper Actions</span>
                                  {isAdmin && (
                                    <div className="flex space-x-1">
                                      <Button
                                        onClick={() => handleEditPaper(paper.id, paper.title, paper.year, paper.month)}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </Button>
                                      <Button
                                        onClick={() => handleDeletePaper(paper.id)}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Links Section */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">Available PDFs</label>
                                  <div className="flex flex-col space-y-1">
                                    {(paper.githubFiles || []).length > 0 ? (
                                      (paper.githubFiles || []).map((file) => (
                                        <Button
                                          key={file.name}
                                          onClick={async () => {
                                            // Update the paper with selected file
                                            const updatedPapers = papers.map(p =>
                                              p.id === paper.id
                                                ? { ...p, selectedGitHubFile: file.downloadUrl }
                                                : p
                                            );

                                            setPapers(updatedPapers);
                                            const updatedPaper = updatedPapers.find(p => p.id === paper.id);
                                            if (updatedPaper) {
                                              setCurrentPaper(updatedPaper);
                                              setSelectedPaper(updatedPaper.id);
                                            }

                                            // Save to MongoDB
                                            try {
                                              await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
                                            } catch (error) {
                                              console.error('Error saving PDF selection:', error);
                                            }
                                          }}
                                          size="sm"
                                          variant={paper.selectedGitHubFile === file.downloadUrl ? "default" : "outline"}
                                          className="justify-start h-8 text-xs cursor-pointer"
                                        >
                                          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                                          </svg>
                                          {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                        </Button>
                                      ))
                                    ) : (
                                      <div className="text-xs text-muted-foreground p-2 text-center border border-dashed border-gray-300 rounded">
                                        No PDFs uploaded yet
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Paper Button - Only show for admins */}
                  {isAdmin && (
                    <Button
                      onClick={handleAddPaper}
                      variant="outline"
                      className="cursor-pointer w-full mt-4 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Question Paper
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* GitHub Uploader Dialog */}
      {showGitHubUploader && currentPaperForUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Upload PDF Files - {papers.find(p => p.id === currentPaperForUpload)?.title}
                </h2>
                <Button
                  onClick={() => setShowGitHubUploader(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <GitHubUploader
                year={year}
                semester={semester}
                branch={branch}
                subject={subjectName}
                moduleId={currentPaperForUpload}
                onFileUploaded={handleGitHubFileUploaded}
                onFileDeleted={handleGitHubFileDeleted}
                onFileSelected={handleGitHubFileSelected}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">
                Delete Question Paper
              </h3>
            </div>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone and will remove all associated PDFs.
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
                onClick={() => confirmDeletePaper(deleteModal.id)}
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