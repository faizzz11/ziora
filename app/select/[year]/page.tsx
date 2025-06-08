import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Home,
  GraduationCap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import academicData from '@/data/academic-years.json';

interface SemesterPageProps {
  params: {
    year: string;
  };
}

const SemesterSelectionPage = ({ params }: SemesterPageProps) => {
  const { academicYears } = academicData;
  
  // Find the selected year
  const selectedYear = academicYears.find(year => year.id === params.year);
  
  // If year not found, show 404
  if (!selectedYear) {
    notFound();
  }

  // Get year-specific gradient for semester cards
  const getYearGradient = (yearId: string) => {
    const gradientMap: Record<string, string> = {
      'FE': 'from-yellow-400 via-yellow-500 to-yellow-600',
      'SE': 'from-green-400 via-green-500 to-green-600', 
      'TE': 'from-violet-400 via-violet-500 to-violet-600',
      'BE': 'from-pink-400 via-pink-500 to-pink-600'
    };
    return gradientMap[yearId] || gradientMap['FE'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-sm font-medium text-gray-700 mb-6 border-0">
            <GraduationCap className="w-4 h-4 mr-2" />
            {selectedYear.fullName}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Choose Your Semester
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Select your current semester in {selectedYear.name} to access study materials and resources.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/select" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Academic Years
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {selectedYear.name} Semesters
          </span>
        </div>

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {selectedYear.semesters.map((semester) => (
            <Link 
              key={semester.id} 
              href={`/select/${params.year}/${semester.number}`}
              className="group h-full"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200 group-hover:-translate-y-2 h-full flex flex-col">
                {/* Semester Number */}
                <div className="text-center mb-6">
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold text-white mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300",
                    `bg-gradient-to-br ${getYearGradient(selectedYear.id)}`
                  )}>
                    {semester.number}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {semester.name}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-center text-gray-600 mb-6 flex-grow">
                  {semester.description}
                </p>
                
                {/* Semester Badge */}
                <div className="flex justify-center mb-6">
                  <Badge variant="outline" className="text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    Semester {semester.number}
                  </Badge>
                </div>
                
                {/* Action Button */}
                <div className="text-center">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-medium group-hover:from-gray-800 group-hover:to-gray-700 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Subjects
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Year Info Card */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                About {selectedYear.fullName}
              </h4>
              <p className="text-gray-600">
                {selectedYear.description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href="/select">
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Years
            </button>
          </Link>
          
          <Link href="/">
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md">
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SemesterSelectionPage;
