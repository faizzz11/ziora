import React from 'react';
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

// Fetch PYQ content from MongoDB based on URL parameters
async function fetchPYQContent(year: string, semester: string, branch: string, subject: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/content?year=${year}&semester=${semester}&branch=${branch}&subject=${subject}&contentType=pyq`,
      { cache: 'no-store' }
    );
    
        if (!response.ok) {
      throw new Error('Failed to fetch PYQ content');
        }
    
        const data = await response.json();
    return data.content;
      } catch (error) {
    console.error('Error fetching PYQ content:', error);
    // Return default structure if fetch fails
    return {
      papers: [
        {
          id: "pyq-2023",
          year: "2023",
          semester: "End Semester",
          type: "Previous Year Question Paper",
          pdfUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/preview",
          downloadUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/view",
          uploadedAt: new Date().toISOString(),
          topics: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
        },
        {
          id: "pyq-2022",
          year: "2022", 
          semester: "End Semester",
          type: "Previous Year Question Paper",
          pdfUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/preview",
          downloadUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/view",
          uploadedAt: new Date().toISOString(),
          topics: ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
        }
      ]
    };
  }
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

  // Fetch dynamic PYQ content based on URL parameters
  const subjectPYQ = await fetchPYQContent(year, semester, branch, subjectName);

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
        year={year}
        semester={semester}
        branch={branch}
      />
    </div>
  );
} 