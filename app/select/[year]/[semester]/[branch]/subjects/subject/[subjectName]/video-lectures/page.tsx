import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import VideoLecturesClient from './VideoLecturesClient';
import branchSubjectsData from '@/data/branch-subjects.json';

interface VideoLecturesPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

// Fetch video-lecs content from MongoDB based on URL parameters
async function fetchVideoLecturesContent(year: string, semester: string, branch: string, subject: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/content?year=${year}&semester=${semester}&branch=${branch}&subject=${subject}&contentType=video-lecs`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video lectures content');
    }
    
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error fetching video lectures content:', error);
    // Return default structure if fetch fails
    return {
    modules: [
      {
        id: "module-1",
        name: "Introduction and Fundamentals",
        topics: [
          {
            id: "topic-1-1",
            title: "Course Overview and Objectives",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "15:30",
            notes: "This introductory lecture covers the fundamental concepts and learning objectives of the course."
          },
          {
            id: "topic-1-2", 
            title: "Basic Concepts and Terminology",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "22:45",
            notes: "Learn the essential terminology and foundational concepts that will be used throughout the course."
          }
        ]
      },
      {
        id: "module-2",
        name: "Core Principles and Theory",
        topics: [
          {
            id: "topic-2-1",
            title: "Theoretical Framework",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: "28:15",
            notes: "Deep dive into the theoretical foundations and frameworks underlying the subject matter."
          },
          {
            id: "topic-2-2",
            title: "Advanced Concepts",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
            duration: "35:20",
            notes: "Explore advanced concepts and their practical applications in real-world scenarios."
          }
        ]
      }
    ]
  };
  }
}

export default async function VideoLecturesPage({ params }: VideoLecturesPageProps) {
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

  // Fetch dynamic video lectures content based on URL parameters
  const subjectVideos = await fetchVideoLecturesContent(year, semester, branch, subjectName);

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
            <span className="text-foreground font-semibold">Video Lectures</span>
          </nav>
        </div>
      </div>

      <VideoLecturesClient 
        subject={subject}
        subjectVideos={subjectVideos}
        subjectName={subjectName}
        year={year}
        semester={semester}
        branch={branch}
      />
    </div>
  );
} 