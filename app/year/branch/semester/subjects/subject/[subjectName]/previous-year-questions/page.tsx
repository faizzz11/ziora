import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import PYQClient from './PYQClient';
import pyqData from '@/data/pyq.json';
import subjectsData from '@/data/subjects.json';

interface PYQPageProps {
  params: Promise<{
    subjectName: string;
  }>;
}

export default async function PreviousYearQuestionsPage({ params }: PYQPageProps) {
  const { subjectName } = await params;
  const subject = subjectsData.subjects.find(s => s.id === subjectName);
  const subjectPYQ = pyqData[subjectName as keyof typeof pyqData];

  if (!subject || !subjectPYQ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Previous Year Questions Not Available</h1>
            <p className="text-gray-600 mb-8">Previous year question papers for this subject are not available yet.</p>
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
            <span className="text-gray-900 font-medium">Previous Year Questions</span>
          </nav>
        </div>
      </section>

      <PYQClient 
        subject={subject}
        subjectPYQ={subjectPYQ}
        subjectName={subjectName}
      />

      <Footer />
    </div>
  );
} 