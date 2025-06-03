import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import SyllabusClient from './SyllabusClient';
import syllabusData from '@/data/syllabus.json';
import impQuestionsData from '@/data/IMP-Questions.json';
import subjectsData from '@/data/subjects.json';

interface SyllabusPageProps {
  params: Promise<{
    subjectName: string;
  }>;
}

export default async function SyllabusImportantQuestionsPage({ params }: SyllabusPageProps) {
  const { subjectName } = await params;
  const subject = subjectsData.subjects.find(s => s.id === subjectName);
  const syllabus = syllabusData[subjectName as keyof typeof syllabusData];
  const impQuestions = impQuestionsData[subjectName as keyof typeof impQuestionsData];

  if (!subject || !syllabus || !impQuestions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Syllabus & Important Questions Not Available</h1>
            <p className="text-gray-600 mb-8">Syllabus and important questions for this subject are not available yet.</p>
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
      
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/subjects" className="hover:text-gray-900 transition-colors">Subjects</Link>
            <span>/</span>
            <Link href={`/subject/${subjectName}`} className="hover:text-gray-900 transition-colors">
              {subject.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Syllabus & Important Questions</span>
          </nav>
        </div>
      </section>

      <SyllabusClient 
        subject={subject}
        syllabus={syllabus}
        impQuestions={impQuestions}
        subjectName={subjectName}
      />

      <Footer />
    </div>
  );
} 