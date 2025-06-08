'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Play } from "lucide-react";
import experimentsData from '@/data/experiments.json';

interface SectionPageProps {
  params: Promise<{
    subjectName: string;
    section: string;
  }>;
}

interface Experiment {
  experimentNo: number;
  title: string;
  aim: string;
  theory: string;
  code: string;
  output: string;
  conclusion: string;
  videoUrl: string;
}

const subjectData: { [key: string]: { name: string; icon: string } } = {
  'operating-system': { name: 'Operating System', icon: '💻' },
  'computer-network': { name: 'Computer Network', icon: '🌐' },
  'database-management': { name: 'Database Management', icon: '🗄️' },
  'data-structures': { name: 'Data Structures', icon: '🌳' },
  'software-engineering': { name: 'Software Engineering', icon: '⚙️' },
  'machine-learning': { name: 'Machine Learning', icon: '🤖' }
};

const sectionData: { [key: string]: { title: string; icon: string; description: string; color: string } } = {
  'video-lectures': {
    title: 'Video Lectures',
    icon: '🎥',
    description: 'Access high-quality video content covering all topics with expert explanations.',
    color: 'bg-red-50 border-red-200'
  },
  'notes': {
    title: 'Notes',
    icon: '📝',
    description: 'Comprehensive study notes, summaries, and quick revision materials.',
    color: 'bg-blue-50 border-blue-200'
  },
  'Practicals-Code-&-Lab-Manual': {
    title: 'Practicals Code & Lab Manual',
    icon: '📚',
    description: 'Detailed study materials and comprehensive code & lab manuals for easy understanding and learning',
    color: 'bg-green-50 border-green-200'
  },
  'previous-year-questions': {
    title: 'Previous Year Questions',
    icon: '📄',
    description: 'Extensive collection of previous year exam questions with solutions.',
    color: 'bg-purple-50 border-purple-200'
  },
  'important-questions': {
    title: 'Syllabus & Important Questions',
    icon: '⭐',
    description: 'Carefully selected important questions for exam preparation.',
    color: 'bg-yellow-50 border-yellow-200'
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
  sectionInfo 
}: {
  subjectName: string;
  subject: { name: string; icon: string };
  sectionInfo: { title: string; icon: string; description: string; color: string };
}) => {
  const [activeTab, setActiveTab] = useState('experiments');
  const experiments = (experimentsData as any)[subjectName] as Experiment[] || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/subjects" className="hover:text-gray-900 transition-colors">Subjects</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/subject/${subjectName}`} className="hover:text-gray-900 transition-colors">
              {subject.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{sectionInfo.title}</span>
          </nav>
        </div>
      </section>

      {/* Section Header */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-4xl">{subject.icon}</div>
              <div className="text-4xl">{sectionInfo.icon}</div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default function SectionPage({ params }: SectionPageProps) {
  const [subjectName, setSubjectName] = useState<string>('');
  const [section, setSection] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        const decodedSection = decodeURIComponent(resolvedParams.section);
        
        // Debug logging
        console.log('Debug - Raw section:', resolvedParams.section);
        console.log('Debug - Decoded section:', decodedSection);
        console.log('Debug - Available sections:', Object.keys(sectionData));
        
        // Redirect important-questions to syllabus-important-questions
        if (decodedSection === 'important-questions') {
          router.push(`/subject/${resolvedParams.subjectName}/syllabus-important-questions`);
          return;
        }
        
        setSubjectName(resolvedParams.subjectName);
        setSection(decodedSection);
        setIsLoading(false);
      } catch (error) {
        console.error('Error resolving params:', error);
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const subject = subjectData[subjectName];
  const sectionInfo = sectionData[section];

  console.log('Debug - Subject found:', !!subject);
  console.log('Debug - Section info found:', !!sectionInfo);

  if (!subject || !sectionInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
            <p className="text-sm text-gray-500 mb-4">Debug: Subject={subjectName}, Section={section}</p>
            <Link href="/subjects" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              Back to Subjects
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle Practicals Code & Lab Manual section
  if (section === 'Practicals-Code-&-Lab-Manual') {
    return (
      <PracticalsLabManualSection 
        subjectName={subjectName}
        subject={subject}
        sectionInfo={sectionInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumb */}
      <section className="px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/subjects" className="hover:text-gray-900 transition-colors">Subjects</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/subject/${subjectName}`} className="hover:text-gray-900 transition-colors">
              {subject.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{sectionInfo.title}</span>
          </nav>
        </div>
      </section>

      {/* Section Header */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-5xl">{subject.icon}</div>
              <div className="text-5xl">{sectionInfo.icon}</div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {sectionInfo.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {sectionInfo.description} for <span className="font-semibold">{subject.name}</span>
            </p>
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              Coming Soon
            </Badge>
          </div>

          {/* Content Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Card className={`${sectionInfo.color} border-2 p-8`}>
                <CardHeader className="text-center pb-6">
                  <div className="text-4xl mb-4">{sectionInfo.icon}</div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {sectionInfo.title} Content
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    This section is under development and will be available soon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
                    <ul className="space-y-2 text-gray-600">
                      {section === 'video-lectures' && (
                        <>
                          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>HD quality video lectures</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Interactive problem-solving sessions</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Downloadable content for offline viewing</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>Expert instructors with industry experience</li>
                        </>
                      )}
                      {section === 'notes' && (
                        <>
                          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Comprehensive chapter-wise notes</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Quick revision summaries</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Formula sheets and important concepts</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>Visual diagrams and flowcharts</li>
                        </>
                      )}
                      {section === 'reference-books' && (
                        <>
                          <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Standard textbook recommendations</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Author-wise book categorization</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Digital book access links</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>Research paper collections</li>
                        </>
                      )}
                      {section === 'previous-year-questions' && (
                        <>
                          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>Past 10 years question papers</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>University-specific exam patterns</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>Detailed solutions and explanations</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>Marking scheme analysis</li>
                        </>
                      )}
                      {section === 'important-questions' && (
                        <>
                          <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>High weightage topic questions</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Practice test series</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Mock examination papers</li>
                          <li className="flex items-center"><span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>Sample answer formats</li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="border-2 border-gray-200 p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Navigation</CardTitle>
                  <CardDescription className="text-gray-600">
                    Explore other sections of {subject.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/subject/${subjectName}/video-lectures`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'video-lectures' ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}`}>
                    🎥 Video Lectures
                  </Link>
                  <Link href={`/subject/${subjectName}/notes`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'notes' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                    📝 Notes
                  </Link>
                  <Link href={`/subject/${subjectName}/Practicals-Code-&-Lab-Manual`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'Practicals-Code-&-Lab-Manual' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>
                    📚 Practicals Code & Lab Manual
                  </Link>
                  <Link href={`/subject/${subjectName}/previous-year-questions`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'previous-year-questions' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}>
                    📄 Previous Year Questions
                  </Link>
                  <Link href={`/subject/${subjectName}/important-questions`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'important-questions' ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50'}`}>
                    ⭐ Syllabus & Important Questions
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 