'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Paper {
  id: string;
  title: string;
  year: string;
  month: string;
  fileName: string;
  pdfUrl: string;
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

const deletePaperFromAPI = async (year: string, semester: string, branch: string, subjectName: string, papers: Paper[]) => {
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
      throw new Error(error.message || 'Failed to delete paper');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
};



export default function PYQClient({ subject, subjectPYQ, subjectName, year, semester, branch }: PYQClientProps) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [papers, setPapers] = useState<Paper[]>(subjectPYQ?.papers || []);
  const [editingPaper, setEditingPaper] = useState<string | null>(null);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [editPaperData, setEditPaperData] = useState({
    title: '',
    year: '',
    month: '',
    fileName: '',
    pdfUrl: ''
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

  // Helper function to convert Google Drive URLs to embeddable format
  const getEmbeddablePdfUrl = (url: string) => {
    if (!url) return '';
    
    // Check if it's a Google Drive URL
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      // Convert to embeddable format
      return `https://drive.google.com/file/d/${fileId}/preview?usp=embed_facebook`;
    }
    
    // For regular PDF URLs, return as is
    return url;
  };

  // Remove the automatic save useEffect since we now save explicitly through API calls

  // Add useEffect to refresh iframe when selected paper changes
  useEffect(() => {
    if (selectedPaper) {
      setIsLoading(true);
      setRefreshKey(prev => prev + 1);
      
      // Set a timeout to hide loading after iframe should have loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [selectedPaper]);

  const handlePaperSelect = (paperId: string) => {
    const paper = papers.find(p => p.id === paperId);
    if (paper) {
      setSelectedPaper(paper);
    }
  };

  const handleFullView = () => {
    if (selectedPaper) {
      // Check if it's a Google Drive URL
      const driveMatch = selectedPaper.pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        // For Google Drive, open the original sharing URL
        window.open(selectedPaper.pdfUrl, '_blank');
      } else {
        // For local files, use the fileName
        window.open(`/PYQ-pdf/${selectedPaper.fileName}`, '_blank');
      }
    }
  };

  const handleDownload = () => {
    if (selectedPaper) {
      // Check if it's a Google Drive URL
      const driveMatch = selectedPaper.pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        // For Google Drive, use the direct download URL
        window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
      } else {
        // For local files, create a download link
        const link = document.createElement('a');
        link.href = `/PYQ-pdf/${selectedPaper.fileName}`;
        link.download = selectedPaper.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleAddPaper = () => {
    setIsAddingPaper(true);
    setEditPaperData({
      title: '',
      year: '',
      month: '',
      fileName: '',
      pdfUrl: ''
    });
  };

  const handleEditPaper = (paperId: string) => {
    const paper = papers.find(p => p.id === paperId);
    if (paper) {
      setEditingPaper(paperId);
      setEditPaperData({
        title: paper.title,
        year: paper.year,
        month: paper.month,
        fileName: paper.fileName,
        pdfUrl: paper.pdfUrl
      });
    }
  };

  const handleSavePaper = async () => {
    try {
      let updatedPapers;
      
      if (editingPaper) {
        // Update existing paper
        updatedPapers = papers.map(paper => 
          paper.id === editingPaper ? { ...paper, ...editPaperData } : paper
        );
        await updatePaperInAPI(year, semester, branch, subjectName, updatedPapers);
        setPapers(updatedPapers);
        toast.success("Paper updated successfully");
      } else {
        // Add new paper
        const newPaper = {
          id: Date.now().toString(),
          ...editPaperData
        };
        updatedPapers = [...papers, newPaper];
        await savePaperToAPI(year, semester, branch, subjectName, updatedPapers);
        setPapers(updatedPapers);
        toast.success("Paper added successfully");
      }
      setEditingPaper(null);
      setIsAddingPaper(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save paper");
    }
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

  const confirmDeletePaper = async () => {
    try {
      const updatedPapers = papers.filter(paper => paper.id !== deleteModal.id);
      await deletePaperFromAPI(year, semester, branch, subjectName, updatedPapers);
      setPapers(updatedPapers);
      if (selectedPaper?.id === deleteModal.id) {
        setSelectedPaper(null);
      }
      setDeleteModal({ isOpen: false, id: '', title: '' });
      toast.success("Paper deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete paper");
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Previous Year Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Subject: <span className="font-semibold text-foreground">{subjectPYQ.subjectName}</span>
            </p>
          </div>
          
          {/* Dropdown for paper selection */}
          <div className="w-64">
            <Select onValueChange={handlePaperSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Question Paper" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((paper) => (
                  <div key={paper.id} className="flex items-center justify-between px-2 py-1 hover:bg-secondary dark:hover:bg-[oklch(0.205_0_0)]">
                    <SelectItem value={paper.id}>
                      {paper.title}
                    </SelectItem>
                    {isAdmin && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditPaper(paper.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePaper(paper.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <div className="border-t border-gray-200 mt-1">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center py-2 text-blue-600"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddPaper();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Paper
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] border border-border rounded-lg p-4">
          <p className="text-foreground text-sm">
            📝 Select a question paper from the dropdown above to view and download previous year questions. 
            You can view the PDF directly in the browser or download it for offline study.
          </p>
        </div>
      </div>



      {/* Paper Display Section */}
      {selectedPaper ? (
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardContent className="p-0">
            {/* Paper Header with Full View Button */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedPaper.month} {selectedPaper.year} - {subjectPYQ.subjectName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Question Paper • {selectedPaper.title}
                </p>
              </div>
              
              <Button 
                onClick={handleFullView}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Full Screen</span>
              </Button>
            </div>

            {/* PDF Preview */}
            <div className="p-6">
              <div className="relative bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                {selectedPaper.pdfUrl ? (
                  <>
                    {isLoading && (
                      <div className="absolute inset-0 bg-secondary dark:bg-[oklch(0.185_0_0)] flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Loading PDF...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      key={refreshKey}
                      src={getEmbeddablePdfUrl(selectedPaper.pdfUrl)}
                      className="w-full h-full border-0"
                      title={`${selectedPaper.title} Question Paper`}
                      loading="lazy"
                      allow="autoplay"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setIsLoading(false);
                        console.log('PDF failed to load, attempting refresh...');
                        setTimeout(() => setRefreshKey(prev => prev + 1), 1000);
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center">
                    <div>
                      <svg className="w-24 h-24 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-muted-foreground text-lg">
                        {selectedPaper.title} Question Paper
                      </p>
                      <p className="text-muted-foreground/70 text-sm mt-2">
                        Click "Full Screen" to view the complete paper
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 p-6 border-t border-border bg-secondary dark:bg-[oklch(0.205_0_0)]">
              <Button 
                onClick={handleFullView}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>View Full PDF</span>
              </Button>
              
              <Button 
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                </svg>
                <span>Download PDF</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-20 h-20 text-muted-foreground mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a Question Paper
              </h3>
              <p className="text-muted-foreground">
                Choose a question paper from the dropdown above to view and download previous year questions for {subjectPYQ.subjectName}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paper Edit Dialog */}
      <Dialog open={editingPaper !== null || isAddingPaper} onOpenChange={() => {
        setEditingPaper(null);
        setIsAddingPaper(false);
      }}>
        <DialogContent className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingPaper ? 'Edit Paper' : 'Add New Paper'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPaper ? 'Update the paper details below.' : 'Enter the details for the new paper.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-foreground">Title</Label>
              <Input
                id="title"
                value={editPaperData.title}
                onChange={(e) => setEditPaperData({ ...editPaperData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year" className="text-foreground">Year</Label>
              <Input
                id="year"
                value={editPaperData.year}
                onChange={(e) => setEditPaperData({ ...editPaperData, year: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="month" className="text-foreground">Month</Label>
              <Input
                id="month"
                value={editPaperData.month}
                onChange={(e) => setEditPaperData({ ...editPaperData, month: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fileName" className="text-foreground">File Name</Label>
              <Input
                id="fileName"
                value={editPaperData.fileName}
                onChange={(e) => setEditPaperData({ ...editPaperData, fileName: e.target.value })}
                placeholder="e.g., math-2023-may.pdf"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdfUrl" className="text-foreground">PDF URL</Label>
              <Input
                id="pdfUrl"
                value={editPaperData.pdfUrl}
                onChange={(e) => setEditPaperData({ ...editPaperData, pdfUrl: e.target.value })}
                placeholder="e.g., /PYQ-pdf/math-2023-may.pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingPaper(null);
              setIsAddingPaper(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSavePaper}>
              {editingPaper ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => {
        if (!open) setDeleteModal({ isOpen: false, id: '', title: '' });
      }}>
        <DialogContent className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Paper</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, id: '', title: '' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePaper}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 