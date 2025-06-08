import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import SyllabusClient from './SyllabusClient';
import syllabusData from '@/data/syllabus.json';
import impQuestionsData from '@/data/IMP-Questions.json';
import branchSubjectsData from '@/data/branch-subjects.json';

interface SyllabusPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
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

  const syllabus = syllabusData[subjectName as keyof typeof syllabusData] || { 
    subjectName: subject.name, 
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
  };

  const impQuestions = impQuestionsData[subjectName as keyof typeof impQuestionsData] || { 
    subjectName: subject.name, 
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
            <span className="text-gray-900 font-semibold">Syllabus & Important Questions</span>
          </nav>
        </div>
      </div>

      <SyllabusClient 
        subject={subject}
        syllabus={syllabus}
        impQuestions={impQuestions}
        subjectName={subjectName}
        backUrl={backUrl}
      />
    </div>
  );
} 