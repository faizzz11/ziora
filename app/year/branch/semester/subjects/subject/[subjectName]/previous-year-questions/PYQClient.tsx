'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

interface Paper {
  id: string;
  title: string;
  year: string;
  month: string;
  fileName: string;
  imagePreview: string;
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
  topics: string[];
  materials: string;
  color: string;
}

interface PYQClientProps {
  subject: Subject;
  subjectPYQ: SubjectPYQ;
  subjectName: string;
}

export default function PYQClient({ subject, subjectPYQ, subjectName }: PYQClientProps) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePaperSelect = (paperId: string) => {
    const paper = subjectPYQ.papers.find(p => p.id === paperId);
    if (paper) {
      setSelectedPaper(paper);
      setIsZoomed(false); // Reset zoom when changing papers
    }
  };

  const handleFullView = () => {
    if (selectedPaper) {
      // Open the full PDF in a new tab
      window.open(`/PYQ-img/${selectedPaper.fileName}`, '_blank');
    }
  };

  const handleDownload = () => {
    if (selectedPaper) {
      // Create a download link
      const link = document.createElement('a');
      link.href = `/PYQ-img/${selectedPaper.fileName}`;
      link.download = selectedPaper.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Previous Year Questions
            </h1>
            <p className="text-lg text-gray-600">
              Subject: <span className="font-semibold text-gray-900">{subjectPYQ.subjectName}</span>
            </p>
          </div>
          
          {/* Dropdown for paper selection */}
          <div className="w-64">
            <Select onValueChange={handlePaperSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Question Paper" />
              </SelectTrigger>
              <SelectContent>
                {subjectPYQ.papers.map((paper) => (
                  <SelectItem key={paper.id} value={paper.id}>
                    {paper.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            📝 Select a question paper from the dropdown above to view and download previous year questions. 
            You can zoom in for better readability or download the paper for offline study.
          </p>
        </div>
      </div>

      {/* Paper Display Section */}
      {selectedPaper ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            {/* Paper Header with Full View Button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPaper.month} {selectedPaper.year} - {subjectPYQ.subjectName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
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

            {/* Paper Preview */}
            <div className="p-6">
              <div 
                className={`relative bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 ${
                  isZoomed ? 'transform scale-110' : ''
                }`}
                style={{ 
                  height: isZoomed ? '80vh' : '60vh',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                }}
                onClick={toggleZoom}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {selectedPaper.imagePreview ? (
                    <Image
                      src={selectedPaper.imagePreview}
                      alt={`${selectedPaper.title} Question Paper`}
                      fill
                      className="object-contain"
                      onError={() => {
                        // Fallback if image doesn't exist
                        console.log('Image not found, showing placeholder');
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 text-lg">
                        {selectedPaper.title} Question Paper
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Click "Full Screen" to view the complete paper
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Zoom indicator */}
                {selectedPaper.imagePreview && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 p-6 border-t border-gray-200 bg-gray-50">
              <Button 
                onClick={toggleZoom}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>{isZoomed ? 'Zoom Out' : 'Zoom In'}</span>
              </Button>
              
              <Button 
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-gray-900 text-white hover:bg-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V5a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a4 4 0 01-4 4z" />
                </svg>
                <span>Download</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Question Paper
              </h3>
              <p className="text-gray-600">
                Choose a question paper from the dropdown above to view and download previous year questions for {subjectPYQ.subjectName}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 