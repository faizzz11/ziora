import React from 'react';
import Link from 'next/link';
import Navbar from "@/components/animate-ui/Navbar";
import Footer from "@/components/landing/Footer";
import NotesClient from './NotesClient';
import videosData from '@/data/videos.json';
import subjectsData from '@/data/subjects.json';

interface NotesPageProps {
  params: Promise<{
    subjectName: string;
  }>;
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { subjectName } = await params;
  const subject = subjectsData.subjects.find(s => s.id === subjectName);
  const subjectVideos = videosData[subjectName as keyof typeof videosData];

  if (!subject || !subjectVideos) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Notes Not Available</h1>
            <p className="text-gray-600 mb-8">Notes content for this subject is not available yet.</p>
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
            <span className="text-gray-900 font-medium">Notes</span>
          </nav>
        </div>
      </section>

      <NotesClient 
        subject={subject}
        subjectVideos={subjectVideos}
        subjectName={subjectName}
      />

      <Footer />
    </div>
  );
} 