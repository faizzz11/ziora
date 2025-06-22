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
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import academicData from '@/data/academic-years.json';

interface SemesterPageProps {
  params: {
    year: string;
    semester: string;
  };
}

// Define branch icon mapping
const getBranchIcon = (branchId: string) => {
  const iconMap: Record<string, { icon: React.ComponentType<any>, gradient: string }> = {
    'computer-engineering': {
      icon: Monitor,
      gradient: 'from-sky-400 via-sky-500 to-sky-600' // Cool, techy blue
    },
    'electrical-engineering': {
      icon: Zap,
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600' // Bright yellow
    },
    'mechanical-engineering': {
      icon: Settings,
      gradient: 'from-pink-400 via-pink-500 to-pink-600' // Pink (as requested)
    },
    'civil-engineering': {
      icon: Building,
      gradient: 'from-green-400 via-green-500 to-green-600' // Pink (as requested)
    },
    'electronics-telecommunications': {
      icon: Radio,
      gradient: 'from-purple-400 via-purple-500 to-purple-600' // Digital & vibrant
    },
    'information-technology': {
      icon: Globe,
      gradient: 'from-red-400 via-red-500 to-red-600' // Bright red (as requested)
    }
  };
  return iconMap[branchId] || iconMap['computer-engineering'];
};


const branches = [
  {
    id: 'computer-engineering',
    name: 'Computer Engineering',
    shortName: 'COMP',
    description: 'Software, Hardware, and System Design',
    subjects: 8
  },
  {
    id: 'electrical-engineering',
    name: 'Electrical Engineering',
    shortName: 'ELEC',
    description: 'Power Systems, Electronics, and Control',
    subjects: 8
  },
  {
    id: 'mechanical-engineering',
    name: 'Mechanical Engineering',
    shortName: 'MECH',
    description: 'Thermodynamics, Design, and Manufacturing',
    subjects: 8
  },
  {
    id: 'civil-engineering',
    name: 'Civil Engineering',
    shortName: 'CIVIL',
    description: 'Structures, Materials, and Construction',
    subjects: 8
  },
  {
    id: 'electronics-telecommunications',
    name: 'Electronics and Telecommunications',
    shortName: 'EXTC',
    description: 'Communication Systems and Signal Processing',
    subjects: 8
  },
  {
    id: 'information-technology',
    name: 'Information Technology',
    shortName: 'IT',
    description: 'Software Development and Network Systems',
    subjects: 8
  }
];

const SemesterBranchPage = ({ params }: SemesterPageProps) => {
  const { academicYears } = academicData;
  
  // Find the selected year
  const selectedYear = academicYears.find(year => year.id === params.year);
  
  // If year not found, show 404
  if (!selectedYear) {
    notFound();
  }

  // Find the selected semester
  const selectedSemester = selectedYear.semesters.find(
    semester => semester.number.toString() === params.semester
  );

  if (!selectedSemester) {
    notFound();
  }

  // For first year, redirect directly to subjects (no branch selection)
  if (params.year === 'FE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="inline-flex items-center px-4 py-2 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-6 border-0">
              <GraduationCap className="w-4 h-4 mr-2" />
              {selectedYear.fullName} - Semester {selectedSemester.number}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Your Subjects
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              First year subjects are common for all students. Access your study materials below.
            </p>
          </div>

          {/* Direct to Subjects Button */}
          <div className="text-center mb-12">
            <Link href={`/select/${params.year}/${params.semester}/general/subjects`}>
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-full font-medium hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 text-lg shadow-lg hover:shadow-xl">
                <BookOpen className="w-5 h-5 mr-3" />
                View All Subjects
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </div>

          {/* Info Card */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-2xl p-6 border border-border">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Common Foundation Year
                </h4>
                <p className="text-muted-foreground text-sm">
                  All engineering students study the same fundamental subjects in first year, regardless of their future specialization.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center gap-4 mt-12">
            <Link href={`/select/${params.year}`}>
              <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Semesters
              </button>
            </Link>
            
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
  }

  // For other years, show branch selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="inline-flex items-center px-4 py-2 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-6 border-0">
            <GraduationCap className="w-4 h-4 mr-2" />
            {selectedYear.fullName} - Semester {selectedSemester.number}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Branch
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your engineering branch to access specialized study materials and subjects.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/select" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Academic Years
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          <Link href={`/select/${params.year}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {selectedYear.name} Semesters
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Semester {selectedSemester.number} Branches
          </span>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {branches.map((branch) => {
            const { icon: IconComponent, gradient } = getBranchIcon(branch.id);
            
            return (
              <Link 
                key={branch.id} 
                href={`/select/${params.year}/${params.semester}/${branch.id}/subjects`}
                className="group h-full"
              >
                <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group-hover:border-primary/50 group-hover:-translate-y-2 h-full flex flex-col">
                  {/* Branch Icon */}
                  <div className="text-center mb-4">
                    <div className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300",
                      `bg-gradient-to-br ${gradient}`
                    )}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                  </div>
                  
                  {/* Branch Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 text-center">
                    {branch.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 text-center flex-grow">
                    {branch.description}
                  </p>
                  
                  {/* Subjects Count */}
                  <div className="flex items-center justify-center mb-4">
                    <Badge variant="secondary" className="text-xs font-medium">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {branch.subjects} Subjects
                    </Badge>
                  </div>
                  
                  {/* Action Button */}
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 text-white rounded-full font-medium group-hover:from-gray-800 group-hover:to-gray-700 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-300 text-sm shadow-md group-hover:shadow-lg">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Subjects
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Semester Info Card */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-2xl p-6 border border-border">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {selectedSemester.name}
              </h4>
              <p className="text-muted-foreground">
                {selectedSemester.description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href={`/select/${params.year}`}>
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Semesters
            </button>
          </Link>
          
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

export default SemesterBranchPage;
