'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Copy, Play, ArrowLeft, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import experimentsData from '@/data/experiments.json';
import branchSubjectsData from '@/data/branch-subjects.json';

interface PracticalsPageProps {
  params: Promise<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
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
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Experiment No: {experiment.experimentNo}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                  {experiment.title}
                </CardDescription>
              </div>
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
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
                  className="flex items-center space-x-2 hover:bg-gray-50"
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
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Experiment No: {experiment.experimentNo}
                </CardTitle>
                <CardDescription className="text-lg font-semibold text-gray-700 mt-2">
                  {experiment.title}
                </CardDescription>
              </div>
              <Badge className="bg-gray-100 text-gray-800 px-3 py-1 flex items-center space-x-1">
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

export default function PracticalsPage({ params }: PracticalsPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    year: string;
    semester: string;
    branch: string;
    subjectName: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('experiments');
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
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

  const experiments = (experimentsData as any)[resolvedParams.subjectName] || [];
  const backUrl = `/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects/subject/${resolvedParams.subjectName}`;

  // Debug information
  console.log('Subject Name:', resolvedParams.subjectName);
  console.log('Available experiment keys:', Object.keys(experimentsData));
  console.log('Experiments found:', experiments.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/select" className="hover:text-gray-900 transition-colors font-medium">Academic Years</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/select/${resolvedParams.year}/${resolvedParams.semester}/${resolvedParams.branch}/subjects`} className="hover:text-gray-900 transition-colors font-medium">Subjects</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={backUrl} className="hover:text-gray-900 transition-colors font-medium">
              {subject.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Practicals Code & Lab Manual</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="p-6 rounded-3xl bg-gray-100">
              <div className="w-12 h-12 flex items-center justify-center text-gray-700 text-2xl">📚</div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Practicals Code & Lab Manual
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Detailed study materials and comprehensive code & lab manuals for <span className="font-semibold">{subject.name}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'experiments'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧪 Experiments & Code
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎥 Experiment Videos
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Subject ID: <code className="bg-gray-100 px-2 py-1 rounded">{resolvedParams.subjectName}</code> | 
            Experiments Found: <span className="font-semibold">{experiments.length}</span>
          </p>
          {experiments.length === 0 && (
            <p className="text-yellow-600 mt-2">
              No experiments found for this subject. Available subjects: {Object.keys(experimentsData).join(', ')}
            </p>
          )}
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {experiments.length > 0 ? (
            <>
              {activeTab === 'experiments' && <ExperimentsTab experiments={experiments} />}
              {activeTab === 'videos' && <ExperimentVideosTab experiments={experiments} />}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Experiments Available</h3>
              <p className="text-gray-600 mb-4">
                Experiments for <strong>{resolvedParams.subjectName}</strong> are not yet available.
              </p>
              <p className="text-sm text-gray-500">
                Available subjects with experiments: <br/>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {Object.keys(experimentsData).join(', ')}
                </span>
              </p>
            </div>
          )}
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
} 