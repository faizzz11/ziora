'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Play, 
  Video, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Star,
  ChevronRight,
  ArrowLeft,
  Home,
  Award,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from '@/lib/utils';
import branchSubjectsData from '@/data/branch-subjects.json';
import experimentsData from '@/data/experiments.json';

interface SubjectPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  }>;
}



const sectionData: { [key: string]: { title: string; icon: React.ComponentType<{ className?: string }>; description: string; gradient: string } } = {
  'video-lectures': {
    title: 'Video Lectures',
    icon: Video,
    description: 'Access high-quality video content covering all topics with expert explanations.',
    gradient: 'from-red-500 to-pink-500'
  },
  'notes': {
    title: 'Notes',
    icon: FileText,
    description: 'Comprehensive study notes, summaries, and quick revision materials.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  'practicals': {
    title: 'Practicals Code & Lab Manual',
    icon: BookOpen,
    description: 'Detailed study materials and comprehensive code & lab manuals for easy understanding and learning',
    gradient: 'from-green-500 to-teal-500'
  },
  'previous-year-questions': {
    title: 'Previous Year Questions',
    icon: HelpCircle,
    description: 'Extensive collection of previous year exam questions with solutions.',
    gradient: 'from-purple-500 to-indigo-500'
  },
  'syllabus-important-questions': {
    title: 'Syllabus & Important Questions',
    icon: Star,
    description: 'Carefully selected important questions for exam preparation.',
    gradient: 'from-yellow-500 to-orange-500'
  }
};



// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show toast for fallback too
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  });
};

// Component for Experiments tab
const ExperimentsTab = ({ experiments }: { experiments: Experiment[] }) => {
  return (
    <div className="space-y-8">
      {experiments.map((experiment) => (
        <Card key={experiment.experimentNo} className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Experiment No: {experiment.experimentNo}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                  {experiment.title}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                Lab Manual
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Aim Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📋 Aim:
              </h3>
              <p className="text-gray-700 leading-relaxed">{experiment.aim}</p>
            </div>

            {/* Theory Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📖 Theory:
              </h3>
              <p className="text-gray-700 leading-relaxed">{experiment.theory}</p>
            </div>

            {/* Code Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  💻 Code:
                </h3>
                <Button
                  onClick={() => copyToClipboard(experiment.code)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-green-50"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </Button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {experiment.code}
                </pre>
              </div>
            </div>

            {/* Output Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                📊 Output:
              </h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-gray-800 text-sm font-mono whitespace-pre-wrap">
                  {experiment.output}
                </pre>
              </div>
            </div>

            {/* Conclusion Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                🎯 Conclusion:
              </h3>
              <p className="text-gray-700 leading-relaxed">{experiment.conclusion}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for Experiment Videos tab
const ExperimentVideosTab = ({ experiments }: { experiments: Experiment[] }) => {
  return (
    <div className="space-y-8">
      {experiments.map((experiment) => (
        <Card key={experiment.experimentNo} className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Experiment No: {experiment.experimentNo}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                  {experiment.title}
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center space-x-1">
                <Play className="h-3 w-3" />
                <span>Video</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="aspect-video w-4/5 mx-auto">
              <iframe
                src={experiment.videoUrl}
                title={`${experiment.title} - Video Tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-md"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Client Component for Practicals Code & Lab Manual
const PracticalsLabManualSection = ({ 
  subjectName, 
  subject, 
  sectionInfo,
  backUrl 
}: {
  subjectName: string;
  subject: { name: string; icon: React.ComponentType<{ className?: string }> };
  sectionInfo: { title: string; icon: React.ComponentType<{ className?: string }>; description: string; gradient: string };
  backUrl: string;
}) => {
  const [activeTab, setActiveTab] = useState('experiments');
  const experiments = (experimentsData as any)[subjectName] || [];

  return (
    <div className="min-h-screen bg-white-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8 flex-wrap">
          <Link href="/select" className="text-sm font-medium text-gray-500 hover:text-gray-700">
            Academic Years
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <Link href={backUrl} className="text-sm font-medium text-gray-500 hover:text-gray-700">
            {subject.name}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{sectionInfo.title}</span>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${sectionInfo.gradient}`}>
              <subject.icon className="w-8 h-8 text-white" />
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${sectionInfo.gradient}`}>
              <sectionInfo.icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {sectionInfo.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {sectionInfo.description} for <span className="font-semibold">{subject.name}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'experiments'
                  ? 'bg-white text-green-700 shadow-sm border border-green-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧪 Experiments & Code
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 Experiment Videos
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'experiments' && <ExperimentsTab experiments={experiments} />}
          {activeTab === 'videos' && <ExperimentVideosTab experiments={experiments} />}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href={backUrl}>
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subject
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function SubjectPage({ params }: SubjectPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
        setIsLoading(false);
      } catch (error) {
        console.error('Error resolving params:', error);
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  if (isLoading || !resolvedParams) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get subject info from branch subjects data
  const { branches } = branchSubjectsData;
  const branchKey = resolvedParams.year === 'first-year' ? 'first-year' : resolvedParams.branch;
  const selectedBranchData = (branches as any)[branchKey];
  const semesterSubjects = selectedBranchData?.semesters[resolvedParams.semester] || [];
  const subject = semesterSubjects.find((s: any) => s.id === resolvedParams.subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Subject Not Found</h1>
            <p className="text-gray-600 mb-8">The subject you're looking for doesn't exist.</p>
          <Link 
            href={`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects`}
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
              Back to Subjects
            </Link>
        </div>
      </div>
    );
  }

  const subjectData = {
    name: subject.name,
    icon: BookOpen // Default icon, you can customize this based on subject
  };

  const backUrl = `/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects`;



  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
          {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/select" className="hover:text-gray-900 transition-colors font-medium">Academic Years</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={backUrl} className="hover:text-gray-900 transition-colors font-medium">
              Subjects
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">{subject.name}</span>
          </nav>
                </div>
              </div>
              
      {/* Subject Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
              <div className="p-6 rounded-3xl bg-gray-100 ">
                <subjectData.icon className="w-12 h-12 text-gray-700" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {subject.name}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {subject.description}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium">
                {subject.code}
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium flex items-center gap-1">
                <Award className="w-3 h-3 text-gray-600" />
                {subject.credits} Credits
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-600" />
                Active
              </Badge>
            </div>
          </div>

          {/* Section Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(sectionData).map(([sectionKey, sectionInfo]) => (
              <Card 
                key={sectionKey}
                className="bg-white border-2 border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                onClick={() => {
                  // Navigate to specific section pages
                  router.push(`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects/subject/${resolvedParams.subjectName}/${sectionKey}`);
                }}
              >
                <CardHeader className="text-center pb-6 flex-grow">
                  <div className="flex justify-center mb-4">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${sectionInfo.gradient} group-hover:scale-110 transition-transform shadow-lg`}>
                      <sectionInfo.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {sectionInfo.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {sectionInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center mt-auto">
                  <Button 
                    className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects/subject/${resolvedParams.subjectName}/${sectionKey}`);
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-white" />
                    Explore Content
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-center gap-4 mt-20">
            <Link href={backUrl}>
              <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Subjects
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="px-6 py-3 rounded-full hover:bg-gray-50 transition-all duration-300">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
} 