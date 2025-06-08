import React from 'react';
import Link from 'next/link';
import { Github, ExternalLink, Users, BookOpen, Target, Lightbulb, Heart, Code2, Sparkles, Rocket, Library, RotateCcw, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AboutPage = () => {
  const founders = [
    {
      name: 'Kaustubh',
      username: 'kstubhieeee',
      github: 'https://github.com/kstubhieeee',
      portfolio: 'https://kaustubh-portfolio.netlify.app/',
      role: 'Full Stack Developer & Co-Founder',
      description: 'Passionate about AI and financial technology. Creator of innovative solutions like AI Financial Advisor and StaffZen.',
      avatar: 'https://github.com/kstubhieeee.png',
      specialties: ['AI/ML', 'Financial Tech', 'Full Stack Development', 'React/TypeScript'],
      projects: ['ai-financial-advisor', 'StaffZen', 'roomzy', 'kaustubh-portfolio']
    },
    {
      name: 'Faiz',
      username: 'faizzz11',
      github: 'https://github.com/faizzz11',
      role: 'Backend Developer & Co-Founder',
      description: 'Expert in backend development and security solutions. Creator of LockIT password manager and educational platforms.',
      avatar: 'https://github.com/faizzz11.png',
      specialties: ['Backend Development', 'Security', 'JavaScript/Node.js', 'Database Design'],
      projects: ['Learnifyy', 'LockIT', 'backend', 'NextJS']
    },
    {
      name: 'Karan',
      username: 'hi-karanb',
      github: 'https://github.com/hi-karanb/',
      role: 'Frontend Developer & Co-Founder',
      description: 'Focused on creating intuitive user experiences and mental health solutions. Specializes in modern web development.',
      avatar: 'https://github.com/hi-karanb.png',
      specialties: ['Frontend Development', 'UI/UX Design', 'Web Development', 'Python'],
      projects: ['mental-health-tracker', 'Web-development', 'Javascript', 'py-str']
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Study Materials',
      description: 'Access to video lectures, notes, practicals, and previous year questions for all engineering subjects.'
    },
    {
      icon: Code2,
      title: 'Hands-on Practicals',
      description: 'Complete lab manuals with working code examples, theory, and video tutorials for practical learning.'
    },
    {
      icon: Target,
      title: 'Exam-Focused Content',
      description: 'Curated important questions, syllabus coverage, and exam-specific preparation materials.'
    },
    {
      icon: Users,
      title: 'Student-Centric Design',
      description: 'Built by students, for students. We understand the challenges and provide solutions that actually work.'
    }
  ];

  const stats = [
    { label: 'Engineering Branches', value: '5+' },
    { label: 'Subjects Covered', value: '50+' },
    { label: 'Study Resources', value: '1000+' },
    { label: 'GitHub Repositories', value: '100+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium mb-4">
              About Ziora
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Empowering Engineering Education
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Ziora is a comprehensive educational platform designed by engineering students to help fellow students 
              excel in their academic journey with curated study materials, practical resources, and exam preparation tools.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To democratize engineering education by providing free, high-quality study resources 
              that help students understand complex concepts and excel in their academic pursuits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Why We Started Ziora</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                As engineering students ourselves, we experienced firsthand the challenges of finding quality study materials, 
                understanding complex practical implementations, and preparing for exams with scattered resources.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Ziora was born out of our desire to create a centralized platform that provides everything a student needs - 
                from theoretical concepts to practical code examples, all organized by semester and subject for easy access.
              </p>
            </div>
                          <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <Heart className="w-5 h-5 text-gray-700 mr-2" />
                  <span className="font-semibold text-gray-900">Built with passion</span>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-gray-500" />
                    Student-first approach to learning
                  </div>
                  <div className="flex items-center">
                    <Rocket className="w-4 h-4 mr-2 text-gray-500" />
                    Modern technology stack
                  </div>
                  <div className="flex items-center">
                    <Library className="w-4 h-4 mr-2 text-gray-500" />
                    Comprehensive curriculum coverage
                  </div>
                  <div className="flex items-center">
                    <RotateCcw className="w-4 h-4 mr-2 text-gray-500" />
                    Continuous updates and improvements
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-gray-500" />
                    Community-driven development
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What Makes Ziora Special
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the features that make Ziora the perfect study companion for engineering students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <feature.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Founders
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The passionate engineering students and developers behind Ziora who are committed to transforming education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <Card key={index} className="text-center border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-6 relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300">
                      <img
                        src={founder.avatar}
                        alt={`${founder.name}'s profile picture`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                   
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {founder.name}
                  </CardTitle>
                  <p className="text-gray-600 font-medium mb-4">
                    {founder.role}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {founder.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {founder.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Notable Projects</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {founder.projects.slice(0, 3).map((project, idx) => (
                        <div key={idx} className="font-mono bg-gray-50 px-2 py-1 rounded">
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={founder.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Link>
                    </Button>
                    {founder.portfolio && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={founder.portfolio} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Portfolio
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Join thousands of engineering students who are already using Ziora to excel in their studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gray-950 text-white hover:bg-gray-700  " asChild>
              <Link href="/select">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Subjects
              </Link>
            </Button>
            <Button size="lg"  className="text-gray-300 bg-gray-950  hover:bg-gray-800 hover:text-white" asChild>
              <Link href="https://github.com/kstubhieeee" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
