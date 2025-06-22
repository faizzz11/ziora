import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  Trophy,
  Calendar,
  ArrowRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import academicData from '@/data/academic-years.json';

const YearSelectionPage = () => {
  const { academicYears } = academicData;

  // Icon mapping for different years
  const getYearIcon = (yearId: string) => {
    const iconMap: Record<string, { 
      icon: React.ComponentType<any>, 
      gradient: string 
    }> = {
  'FE': {
    icon: GraduationCap,
    gradient: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
  },
  'SE': {
    icon: BookOpen,
    gradient: "bg-gradient-to-br from-green-400 via-green-500 to-green-600"
  },
  'TE': {
    icon: Brain,
    gradient: "bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600"
  },
  'BE': {
    icon: Trophy,
    gradient: "bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600"
  }
}

    
    return iconMap[yearId] || iconMap['FE'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary/80 to-secondary rounded-full text-sm font-medium text-muted-foreground mb-6 border-0">
            <Calendar className="w-4 h-4 mr-2" />
            Academic Year Selection
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Year
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your current academic year to access relevant study materials and resources.
          </p>
        </div>

        {/* Years Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {academicYears.map((year) => {
            const { icon: IconComponent, gradient } = getYearIcon(year.id);
            
            return (
              <Link 
                key={year.id} 
                href={`/select/${year.id}`}
                className="group h-full"
              >
                <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-border group-hover:border-primary/50 group-hover:-translate-y-2 h-full flex flex-col">
                  {/* Year Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={cn(
                      "p-3 rounded-xl",
                      gradient,
                      "shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                    )}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Year Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 text-center">
                    {year.name}
                  </h3>
                  
                  {/* Full Name */}
                  <p className="text-sm font-medium text-muted-foreground mb-3 text-center">
                    {year.fullName}
                  </p>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 text-center line-clamp-3 flex-grow">
                    {year.description}
                  </p>
                  
                  {/* Semester Count Badge */}
                  <div className="flex items-center justify-center mb-4">
                    <Badge variant="outline" className="text-xs font-medium">
                      <Calendar className="w-3 h-3 mr-1" />
                      {year.semesters.length} Semesters
                    </Badge>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <span className="mr-2">Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Action */}
        <div className="text-center mt-12">
          <Link href="/">
            <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary rounded-full hover:bg-secondary/80 transition-all duration-300 border border-border hover:border-primary/50 shadow-sm hover:shadow-md">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default YearSelectionPage;
