import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

// Fetch practicals content from MongoDB based on URL parameters
async function fetchPracticalsContent(year: string, semester: string, branch: string, subject: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/content?year=${year}&semester=${semester}&branch=${branch}&subject=${subject}&contentType=practicals`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch practicals content');
    }
    
    const data = await response.json();
    return data.content;
      } catch (error) {
    console.error('Error fetching practicals content:', error);
    // Return default structure if fetch fails
    return {
      experiments: [
        {
          experimentNo: 1,
          title: "Introduction to Lab Equipment",
          aim: "To familiarize students with basic lab equipment and safety procedures",
          theory: "Basic laboratory safety and equipment introduction...",
          code: "// Sample code will be provided here",
          output: "Expected output and observations",
          conclusion: "Understanding of basic lab procedures achieved",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        },
        {
          experimentNo: 2,
          title: "Basic Programming Concepts",
          aim: "To understand fundamental programming concepts",
          theory: "Programming fundamentals and basic concepts...",
          code: "// Sample code implementation",
          output: "Program execution results",
          conclusion: "Basic programming concepts demonstrated",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
      ]
    };
  }
}

export default async function PracticalsPage({ params }: PracticalsPageProps) {
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

  // Fetch dynamic practicals content based on URL parameters
  const practicalsData = await fetchPracticalsContent(year, semester, branch, subjectName);
  const experiments = practicalsData.experiments || [];

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
            <span className="text-foreground font-semibold">Practicals Code & Lab Manual</span>
          </nav>
        </div>
            </div>

      <PracticalsClient 
        experiments={experiments}
        subject={subject}
        subjectName={subjectName}
        year={year}
        semester={semester}
        branch={branch}
      />

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12 pb-8">
          <Link href={backUrl}>
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-secondary transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subject
            </Button>
                  </Link>
          
          <Link href="/">
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-secondary transition-all duration-300">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
                  </Link>
      </div>
    </div>
  );
} 