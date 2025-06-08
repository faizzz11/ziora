'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Module {
  moduleNo: string;
  title: string;
  hours: number;
  topics: string[];
}

interface Syllabus {
  subjectName: string;
  totalHours: number;
  modules: Module[];
}

interface Question {
  question: string;
  frequency: number;
  repetition: string;
}

interface ImpModule {
  moduleNo: string;
  title: string;
  questions: Question[];
}

interface ImpQuestions {
  subjectName: string;
  modules: ImpModule[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics: string[];
  materials: string;
  color: string;
}

interface SyllabusClientProps {
  subject: Subject;
  syllabus: Syllabus;
  impQuestions: ImpQuestions;
  subjectName: string;
}

export default function SyllabusClient({ subject, syllabus, impQuestions, subjectName }: SyllabusClientProps) {
  const [activeTab, setActiveTab] = useState('syllabus');

  const getQuestionColor = (frequency: number) => {
    switch (frequency) {
      case 1:
        return 'text-red-600 font-semibold'; // Most repeated - Red
      case 2:
        return 'text-blue-600 font-semibold'; // 2nd most repeated - Blue  
      case 3:
        return 'text-yellow-600 font-semibold'; // 3rd most repeated - Yellow
      default:
        return 'text-gray-900'; // One time repeated - Black
    }
  };

  const getFrequencyBadge = (frequency: number, repetition: string) => {
    const colorClasses = {
      1: 'bg-red-100 text-red-800 border-red-200',
      2: 'bg-blue-100 text-blue-800 border-blue-200', 
      3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      4: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[frequency as keyof typeof colorClasses]}`}>
        {repetition}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Syllabus & Important Questions
        </h1>
        <p className="text-lg text-gray-600">
          Subject: <span className="font-semibold text-gray-900">{syllabus.subjectName}</span>
        </p>
      </div>

      {/* Tabs for Syllabus and Important Questions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="syllabus" className="text-lg py-3">📚 Syllabus</TabsTrigger>
          <TabsTrigger value="important-questions" className="text-lg py-3">❓ Important Questions</TabsTrigger>
        </TabsList>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {syllabus.subjectName} - Course Syllabus
              </CardTitle>
              <p className="text-sm text-gray-600">
                Total Hours: <span className="font-semibold">{syllabus.totalHours}</span>
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {/* Syllabus Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">Module No.</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-64">Topics</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {syllabus.modules.map((module, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {module.moduleNo}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 align-top">
                          {module.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top">
                          <ul className="space-y-1">
                            {module.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top text-center">
                          {String(module.hours).padStart(2, '0')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                        {syllabus.totalHours}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Important Questions Tab */}
        <TabsContent value="important-questions" className="space-y-6">
          {/* Legend */}
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Question Frequency Legend:</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-red-600 font-semibold">Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-blue-600 font-semibold">2nd Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-yellow-600 font-semibold">3rd Most Repeated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-gray-900">One Time Repeated</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Questions by Module */}
          <div className="space-y-6">
            {impQuestions.modules.map((module, moduleIndex) => (
              <Card key={moduleIndex} className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-200 bg-gray-50">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Module {module.moduleNo} - {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {module.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border-l-4 border-gray-200 pl-4 py-2">
                        <div className="flex items-start justify-between mb-2">
                          <p className={`text-sm leading-relaxed ${getQuestionColor(question.frequency)}`}>
                            <span className="font-medium">Q{questionIndex + 1}.</span> {question.question}
                          </p>
                          <div className="ml-4 flex-shrink-0">
                            {getFrequencyBadge(question.frequency, question.repetition)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 