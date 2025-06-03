import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SectionPageProps {
  params: Promise<{
    subjectName: string;
    section: string;
  }>;
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
  'reference-books': {
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
    title: 'Important Questions',
    icon: '⭐',
    description: 'Carefully selected important questions for exam preparation.',
    color: 'bg-yellow-50 border-yellow-200'
  }
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { subjectName, section } = await params;
  const subject = subjectData[subjectName];
  const sectionInfo = sectionData[section];

  if (!subject || !sectionInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
            <Link href="/subjects" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              Back to Subjects
            </Link>
          </div>
        </div>
        <Footer />
      </div>
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
            <div className="space-y-6">
              {/* Quick Navigation */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/subject/${subjectName}/video-lectures`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'video-lectures' ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'}`}>
                    🎥 Video Lectures
                  </Link>
                  <Link href={`/subject/${subjectName}/notes`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'notes' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                    📝 Notes
                  </Link>
                  <Link href={`/subject/${subjectName}/reference-books`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'reference-books' ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'}`}>
                    📚 oks
                  </Link>
                  <Link href={`/subject/${subjectName}/previous-year-questions`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'previous-year-questions' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}>
                    📄 Previous Year Questions
                  </Link>
                  <Link href={`/subject/${subjectName}/important-questions`} 
                        className={`block p-3 rounded-lg transition-colors ${section === 'important-questions' ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50'}`}>
                    ⭐ Important Questions
                  </Link>
                </CardContent>
              </Card>

              {/* Progress Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Start learning to track your progress!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Study Tips */}
              <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    💡 Study Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Set daily study goals</li>
                    <li>• Practice regularly</li>
                    <li>• Take notes while learning</li>
                    <li>• Review previous topics</li>
                  </ul>
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