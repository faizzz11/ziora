import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SyllabusClient from './SyllabusClient';
import branchSubjectsData from '@/data/branch-subjects.json';

interface SyllabusPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

// Fetch syllabus content from MongoDB based on URL parameters
async function fetchSyllabusContent(year: string, semester: string, branch: string, subject: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/content?year=${year}&semester=${semester}&branch=${branch}&subject=${subject}&contentType=syllabus`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch syllabus content');
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error fetching syllabus content:', error);
    // Return default structure if fetch fails
    return {
      syllabus: {
        subjectName: subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    totalHours: 45, 
    modules: [
      {
        moduleNo: "1",
        title: "Introduction and Fundamentals",
        hours: 12,
        topics: [
          "Basic concepts and terminology",
          "Historical background and evolution", 
          "Fundamental principles and theories",
          "Applications and real-world examples"
        ]
      },
      {
        moduleNo: "2", 
        title: "Core Principles and Methods",
        hours: 15,
        topics: [
          "Theoretical framework and models",
          "Key methodologies and approaches",
          "Problem-solving techniques", 
          "Case studies and analysis"
        ]
      },
      {
        moduleNo: "3",
        title: "Advanced Topics and Applications", 
        hours: 18,
        topics: [
          "Advanced concepts and theories",
          "Modern applications and trends",
          "Industry best practices",
          "Future directions and research areas"
        ]
      }
    ]
      },
      impQuestions: {
        subjectName: subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    modules: [
      {
        moduleNo: "1",
        title: "Introduction and Fundamentals", 
        questions: [
          {
            question: "Explain the fundamental concepts and their significance in the field.",
            frequency: 1,
            repetition: "Most Repeated"
          },
          {
            question: "Discuss the historical evolution and key milestones.",
            frequency: 2, 
            repetition: "2nd Most Repeated"
          },
          {
            question: "What are the basic principles and how do they apply in practice?",
            frequency: 3,
            repetition: "3rd Most Repeated"
          }
        ]
      },
      {
        moduleNo: "2",
        title: "Core Principles and Methods",
        questions: [
          {
            question: "Describe the theoretical framework and its components.",
            frequency: 1,
            repetition: "Most Repeated"
          },
          {
            question: "Compare different methodologies and their effectiveness.",
            frequency: 2,
            repetition: "2nd Most Repeated" 
          },
          {
            question: "Analyze the problem-solving techniques with examples.",
            frequency: 4,
            repetition: "One Time Repeated"
          }
        ]
      },
      {
        moduleNo: "3", 
        title: "Advanced Topics and Applications",
        questions: [
          {
            question: "Evaluate the modern applications and their impact.",
            frequency: 1,
            repetition: "Most Repeated"
          },
          {
            question: "What are the current industry best practices?",
            frequency: 3,
            repetition: "3rd Most Repeated"
          },
          {
            question: "Discuss future trends and research opportunities.",
            frequency: 4,
            repetition: "One Time Repeated"
          }
        ]
      }
    ]
      }
    };
  }
}

export default async function SyllabusImportantQuestionsPage({ params }: SyllabusPageProps) {
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

  // Fetch dynamic syllabus content based on URL parameters
  const syllabusData = await fetchSyllabusContent(year, semester, branch, subjectName);
  const syllabus = syllabusData?.syllabus || {
    subjectName: subject.name,
    totalHours: 45,
    modules: []
  };
  const impQuestions = syllabusData?.impQuestions || {
    subjectName: subject.name,
    modules: []
  };

  const backUrl = `/select/${year}/${semester}/${branch}/subjects/subject/${subjectName}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/select" className="hover:text-foreground transition-colors font-medium">Academic Years</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href={`/select/${year}/${semester}/${branch}/subjects`} className="hover:text-foreground transition-colors font-medium">Subjects</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href={backUrl} className="hover:text-foreground transition-colors font-medium">
              {subject.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">Syllabus & Important Questions</span>
          </nav>
        </div>
      </div>

      <SyllabusClient 
        subject={subject}
        syllabus={syllabus}
        impQuestions={impQuestions}
        subjectName={subjectName}
        backUrl={backUrl}
        year={year}
        semester={semester}
        branch={branch}
      />
    </div>
  );
} 