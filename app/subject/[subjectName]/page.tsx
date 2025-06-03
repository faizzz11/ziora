import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import subjectsData from '@/data/subjects.json';
import sectionsData from '@/data/sections.json';
import featuresData from '@/data/features.json';
import contentData from '@/data/content.json';

interface SubjectPageProps {
  params: Promise<{
    subjectName: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectName } = await params;
  const { subjects } = subjectsData;
  const { sections } = sectionsData;
  const { quickAccess } = featuresData;
  const { subjectPage } = contentData;

  // Find the current subject from the JSON data
  const subject = subjects.find(s => s.id === subjectName);

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Subject Not Found</h1>
            <p className="text-gray-600 mb-8">The subject you're looking for doesn't exist.</p>
            <Link href="/subjects" className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Back to Subjects
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/subjects" className="hover:text-gray-700 transition-colors">
              Subjects
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{subject.name}</span>
          </nav>
          
          {/* Header Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-3xl">{subject.icon}</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    {subject.name}
                  </h1>
                  <div className="flex items-center mt-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {subjectPage.hero.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
                {subject.description}
              </p>
              
              <div className="flex items-center space-x-4">
                <Link href={`/subject/${subjectName}/video-lectures`}>
                  <button className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    {subjectPage.hero.buttons.primary}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <button className="inline-flex items-center px-8 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  {subjectPage.hero.buttons.secondary}
                </button>
              </div>
            </div>
            
            {/* Stats Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{subjectPage.courseOverview.title}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Materials</span>
                    <span className="font-semibold text-gray-900">{subject.materials}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Duration</span>
                    <span className="font-semibold text-gray-900">{subjectPage.courseOverview.estimatedDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difficulty Level</span>
                    <span className="font-semibold text-gray-900">{subjectPage.courseOverview.difficultyLevel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Progress</span>
                    <span className="font-semibold text-gray-900">{subjectPage.courseOverview.progress}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-gray-900">0 of {sections.length} sections</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{subjectPage.studyMaterials.title}</h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              {subjectPage.studyMaterials.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <Link 
                key={section.id} 
                href={`/subject/${subjectName}/${section.id}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <span className="text-xl">{section.icon}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                      {section.count}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {section.duration}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{subjectPage.quickAccess.title}</h2>
            <p className="text-lg text-gray-600">{subjectPage.quickAccess.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickAccess.map((item, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 