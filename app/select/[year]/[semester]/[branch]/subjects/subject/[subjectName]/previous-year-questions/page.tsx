'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PYQClient from './PYQClient';
import branchSubjectsData from '@/data/branch-subjects.json';

interface PYQPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

export default function PreviousYearQuestionsPage({ params }: PYQPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectPYQ, setSubjectPYQ] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        
        // Fetch papers data
        const response = await fetch(`/api/papers?subject=${resolved.subjectName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch papers');
        }
        const data = await response.json();
        setSubjectPYQ(data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  if (isLoading || !resolvedParams || !subjectPYQ) {
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
            <span className="text-gray-900 font-semibold">Previous Year Questions</span>
          </nav>
        </div>
      </div>

      <PYQClient 
        subject={subject}
        subjectPYQ={subjectPYQ}
        subjectName={resolvedParams.subjectName}
      />
    </div>
  );
} 