import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import NotesClient from './NotesClient';
import branchSubjectsData from '@/data/branch-subjects.json';

interface NotesPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}

// Fetch notes content from MongoDB based on URL parameters
async function fetchNotesContent(year: string, semester: string, branch: string, subject: string) {
  try {
    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    
    // Import MongoDB client for direct database access during SSR
    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // Create the query path
    const queryPath = `${year}.sem-${semester}.${actualBranch}.${subject}.notes`;
    
    // Find the document and get the specific content
    const result = await collection.findOne({}, { projection: { [queryPath]: 1 } });
    
    // Extract the nested content
    const content = result && getNestedValue(result, queryPath.split('.'));
    
    return content || {
      modules: [
        {
          id: "module-1",
          name: "Introduction and Fundamentals",
          pdfUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/preview",
          relatedVideoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          topics: [
            {
              id: "topic-1-1",
              title: "Course Overview and Objectives", 
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              duration: "15:30",
              notes: "Introduction to the course structure and learning objectives."
            }
          ]
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching notes content:', error);
    // Return default structure if fetch fails
    return {
      modules: [
        {
          id: "module-1",
          name: "Introduction and Fundamentals",
          pdfUrl: "https://drive.google.com/file/d/1rlg-623P2ktK6_n6jIS7zYC4zOYGV2ys/preview",
          relatedVideoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          topics: [
            {
              id: "topic-1-1",
              title: "Course Overview and Objectives", 
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              duration: "15:30",
              notes: "Introduction to the course structure and learning objectives."
            }
          ]
        }
      ]
    };
  }
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { year, semester, branch, subjectName } = await params;
  
  // Get subject info from branch subjects data
  const { branches } = branchSubjectsData;
  const branchKey = year === 'FE' ? 'FE' : branch;
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

  // Fetch dynamic notes content based on URL parameters
  const subjectVideos = await fetchNotesContent(year, semester, branch, subjectName);

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
            <span className="text-foreground font-semibold">Notes</span>
          </nav>
        </div>
      </div>

      <NotesClient 
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