'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import experimentsData from '@/data/experiments.json';
import branchSubjectsData from '@/data/branch-subjects.json';
import PracticalsClient from './PracticalsClient';

interface PracticalsPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

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

export default function PracticalsPage({ params }: PracticalsPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        setIsLoading(false);
      } catch (error) {
        console.error('Error resolving params:', error);
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

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
  const subject = semesterSubjects.find((s: any) => s.id === resolvedParams.subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subject Not Found</h1>
          <p className="text-gray-600 mb-8">The subject you're looking for doesn't exist.</p>
          <Link 
            href={`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects`}
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  const experiments = (experimentsData as any)[resolvedParams.subjectName] || [];
  const backUrl = `/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects/subject/${resolvedParams.subjectName}`;

  // Debug information
  console.log('Subject Name:', resolvedParams.subjectName);
  console.log('Available experiment keys:', Object.keys(experimentsData));
  console.log('Experiments found:', experiments.length);

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
            <span className="text-gray-900 font-semibold">Practicals Code & Lab Manual</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Debug Info */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Subject ID: <code className="bg-gray-100 px-2 py-1 rounded">{resolvedParams.subjectName}</code> | 
            Experiments Found: <span className="font-semibold">{experiments.length}</span>
          </p>
          {experiments.length === 0 && (
            <p className="text-yellow-600 mt-2">
              No experiments found for this subject. Available subjects: {Object.keys(experimentsData).join(', ')}
            </p>
          )}
        </div>

        {/* Practicals Client Component */}
        <PracticalsClient experiments={experiments} subject={subject} subjectName={resolvedParams.subjectName} />

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
    </div>
  );
} 