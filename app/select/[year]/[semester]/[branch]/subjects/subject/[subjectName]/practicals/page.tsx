import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Home, BookOpen } from 'lucide-react';
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
    // For FE (First Year Engineering), use 'FE' as branch regardless of URL branch parameter
    const actualBranch = year === 'FE' ? 'FE' : branch;
    
    // Import MongoDB client for direct database access during SSR
    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db('ziora');
    const collection = db.collection('academic_content');

    // Create the query path
    const queryPath = `${year}.sem-${semester}.${actualBranch}.${subject}.practicals`;
    
    // Find the document and get the specific content
    const result = await collection.findOne({}, { projection: { [queryPath]: 1 } });
    
    // Extract the nested content
    const content = result && getNestedValue(result, queryPath.split('.'));
    
    return content || {
      experiments: []
    };
  } catch (error) {
    console.error('Error fetching practicals content:', error);
    // Return empty structure if fetch fails
    return {
      experiments: []
    };
  }
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export default async function PracticalsPage({ params }: PracticalsPageProps) {
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
    icon: BookOpen,
    code: 'N/A',
    credits: 3
  };

  // Fetch dynamic practicals content based on URL parameters
  const practicalsData = await fetchPracticalsContent(year, semester, branch, subjectName);
  const experiments = practicalsData?.experiments || [];

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