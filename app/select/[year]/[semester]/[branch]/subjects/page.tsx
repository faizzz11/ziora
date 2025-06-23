import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Monitor,
  Zap,
  Settings,
  Building,
  Radio,
  Globe,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Home,
  GraduationCap,
  ChevronRight,
  Award,
  Clock,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import academicData from '@/data/academic-years.json';
import branchSubjectsData from '@/data/branch-subjects.json';

interface SubjectsPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
  }>;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

// Define branch icon mapping
const getBranchIcon = (branchId: string) => {
  const iconMap: Record<string, { icon: React.ComponentType<any>, gradient: string }> = {
    'computer-engineering': {
      icon: Monitor,
      gradient: 'from-sky-400 via-sky-500 to-sky-600'
    },
    'electrical-engineering': {
      icon: Zap,
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600'
    },
    'mechanical-engineering': {
      icon: Settings,
      gradient: 'from-pink-400 via-pink-500 to-pink-600'
    },
    'civil-engineering': {
      icon: Building,
      gradient: 'from-green-400 via-green-500 to-green-600'
    },
    'electronics-telecommunications': {
      icon: Radio,
      gradient: 'from-purple-400 via-purple-500 to-purple-600'
    },
    'information-technology': {
      icon: Globe,
      gradient: 'from-red-400 via-red-500 to-red-600'
    },
    'general': {
      icon: GraduationCap,
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600'
    }
  };
  return iconMap[branchId] || iconMap['general'];
};

const branches = {
  'computer-engineering': {
    name: 'Computer Engineering',
    shortName: 'COMP'
  },
  'electrical-engineering': {
    name: 'Electrical Engineering',
    shortName: 'ELEC'
  },
  'mechanical-engineering': {
    name: 'Mechanical Engineering',
    shortName: 'MECH'
  },
  'civil-engineering': {
    name: 'Civil Engineering',
    shortName: 'CIVIL'
  },
  'electronics-telecommunications': {
    name: 'Electronics and Telecommunications',
    shortName: 'EXTC'
  },
  'information-technology': {
    name: 'Information Technology',
    shortName: 'IT'
  },
  'general': {
    name: 'General',
    shortName: 'GEN'
  }
};

const SubjectsPage = async ({ params }: SubjectsPageProps) => {
  const { year, semester, branch } = await params;
  const { academicYears } = academicData;
  const { branches: branchData } = branchSubjectsData;
  
  // Find the selected year
  const selectedYear = academicYears.find(yearItem => yearItem.id === year);
  
  if (!selectedYear) {
    notFound();
  }

  // Find the selected semester
  const selectedSemester = selectedYear.semesters.find(
    semesterItem => semesterItem.number.toString() === semester
  );

  if (!selectedSemester) {
    notFound();
  }

  // Get branch data based on year
  const branchKey = year === 'FE' ? 'FE' : branch;
  const selectedBranchData = (branchData as any)[branchKey];
  
  if (!selectedBranchData) {
    notFound();
  }

  // Get subjects for the selected semester
  const semesterSubjects: Subject[] = selectedBranchData.semesters[semester] || [];
  
  if (semesterSubjects.length === 0) {
    notFound();
  }

  // Get branch display info for FE or regular branches
  const selectedBranch = year === 'FE' 
    ? { name: 'First Year Engineering', shortName: 'FE' }
    : ((branches as any)[branch] || branches.general);
  const { icon: BranchIcon, gradient: branchGradient } = getBranchIcon(year === 'FE' ? 'general' : branch);

  // Generate unique gradient for each subject
  const getSubjectGradient = (index: number) => {
    const gradients = [
      'from-blue-400 via-blue-500 to-blue-600',      // Blue
      'from-emerald-400 via-emerald-500 to-emerald-600', // Emerald
      'from-purple-400 via-purple-500 to-purple-600',    // Purple
      'from-pink-400 via-pink-500 to-pink-600',          // Pink
      'from-orange-400 via-orange-500 to-orange-600',    // Orange
      'from-cyan-400 via-cyan-500 to-cyan-600',          // Cyan
      'from-red-400 via-red-500 to-red-600',             // Red
      'from-green-400 via-green-500 to-green-600',       // Green
      'from-yellow-400 via-yellow-500 to-yellow-600',    // Yellow
      'from-indigo-400 via-indigo-500 to-indigo-600',    // Indigo
      'from-teal-400 via-teal-500 to-teal-600',          // Teal
      'from-rose-400 via-rose-500 to-rose-600',          // Rose
      'from-violet-400 via-violet-500 to-violet-600',    // Violet
      'from-amber-400 via-amber-500 to-amber-600',       // Amber
      'from-lime-400 via-lime-500 to-lime-600',          // Lime
      'from-sky-400 via-sky-500 to-sky-600',             // Sky
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="inline-flex items-center px-4 py-2 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-6 border-0">
            <BranchIcon className="w-4 h-4 mr-2" />
            {selectedBranch.name} - {selectedYear.name} Semester {selectedSemester.number}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Subjects
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a subject to access comprehensive study materials, notes, and resources.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8 flex-wrap">
          <Link href="/select" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Academic Years
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          <Link href={`/select/${year}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {selectedYear.name}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          {year !== 'FE' ? (
            <>
              <Link href={`/select/${year}/${semester}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Semester {selectedSemester.number}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
            </>
          ) : null}
          <span className="text-sm font-medium text-foreground">
            {selectedBranch.shortName} Subjects
          </span>
        </div>

                {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {semesterSubjects.map((subject: Subject, index: number) => (
            <Link 
              key={subject.id} 
              href={`/select/${year}/${semester}/${branch}/subjects/subject/${subject.id}`}
              className="group h-full"
            >
              <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group-hover:border-primary/50 group-hover:-translate-y-2 h-full flex flex-col">
                {/* Subject Icon */}
                <div className="text-center mb-6">
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300",
                    `bg-gradient-to-br ${getSubjectGradient(index)}`
                  )}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                
                </div>
                
                {/* Subject Name */}
                <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                  {subject.name}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground mb-6 text-center line-clamp-3 flex-grow">
                  {subject.description}
                </p>
                
                {/* Subject Stats */}
                <div className="flex justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {subject.credits} Credits
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                {/* Action Button */}
                <div className="text-center">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-full font-medium group-hover:from-gray-800 group-hover:to-gray-700 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Branch Info Card */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-2xl p-6 border border-border">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {selectedBranch.name}
              </h4>
              <p className="text-muted-foreground">
                Semester {selectedSemester.number} curriculum with {semesterSubjects.length} subjects and comprehensive study materials.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12">
          {year !== 'FE' ? (
            <Link href={`/select/${year}/${semester}`}>
              <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Branches
              </button>
            </Link>
          ) : (
            <Link href={`/select/${year}`}>
              <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Semesters
              </button>
            </Link>
          )}
          
          <Link href="/">
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage; 