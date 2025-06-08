import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import PYQClient from './PYQClient';
import pyqData from '@/data/pyq.json';
import branchSubjectsData from '@/data/branch-subjects.json';

interface PYQPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

export default async function PreviousYearQuestionsPage({ params }: PYQPageProps) {
  const { year, semester, branch, subjectName } = await params;
  
  // Get subject info from branch subjects data
  const { branches } = branchSubjectsData;
  const branchKey = year === 'first-year' ? 'first-year' : branch;
  const selectedBranchData = (branches as any)[branchKey];
  const semesterSubjects = selectedBranchData?.semesters[semester] || [];
  const subject = semesterSubjects.find((s: any) => s.id === subjectName) || {
    id: subjectName,
    name: subjectName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Study materials for ${subjectName}`,
    icon: '📚',
    code: 'N/A',
    credits: 3
  };

  const subjectPYQ = pyqData[subjectName as keyof typeof pyqData] || { 
    subjectName: subject.name, 
    papers: [
      {
        id: "paper-1",
        title: "Mid Semester Examination",
        year: "2023",
        month: "October",
        fileName: "sample-midterm-2023.pdf",
        imagePreview: "/api/placeholder/600/800"
      },
      {
        id: "paper-2", 
        title: "End Semester Examination",
        year: "2023",
        month: "December", 
        fileName: "sample-endterm-2023.pdf",
        imagePreview: "/api/placeholder/600/800"
      },
      {
        id: "paper-3",
        title: "Mid Semester Examination", 
        year: "2022",
        month: "October",
        fileName: "sample-midterm-2022.pdf",
        imagePreview: "/api/placeholder/600/800"
      },
      {
        id: "paper-4",
        title: "End Semester Examination",
        year: "2022", 
        month: "December",
        fileName: "sample-endterm-2022.pdf",
        imagePreview: "/api/placeholder/600/800"
      }
    ]
  };

  const backUrl = `/select/${year}/${semester}/${branch}/subjects/subject/${subjectName}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/select" className="hover:text-gray-900 transition-colors font-medium">Academic Years</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/select/${year}/${semester}/${branch}/subjects`} className="hover:text-gray-900 transition-colors font-medium">Subjects</Link>
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
        subjectName={subjectName}
        backUrl={backUrl}
      />
    </div>
  );
} 