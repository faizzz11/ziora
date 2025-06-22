import React from 'react';
import Link from 'next/link';
import { Github, ExternalLink, Users, BookOpen, Target, Lightbulb, Heart, Code2, Sparkles, Rocket, Library, RotateCcw, Star } from 'lucide-react';
import { FaRocket, FaUsers, FaBrain, FaLightbulb, FaGraduationCap, FaCode } from 'react-icons/fa';
import { MdEngineering, MdSchool, MdQuiz, MdVideoLibrary } from 'react-icons/md';
import { BiCodeAlt } from 'react-icons/bi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/animate-ui/Navbar';

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
      description: 'Expert in backend development and security solutions. Creator of Guidant and educational platforms.',
      avatar: 'https://github.com/faizzz11.png',
      specialties: ['Backend Development', 'Security', 'JavaScript/Node.js', 'Database Design'],
      projects: ['Learnifyy', 'LockIT', 'Guidant', 'LinkUP']
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
      <Navbar />
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium mb-4">
              About Ziora
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Empowering Engineering Education
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Ziora is a comprehensive educational platform designed by engineering students to help fellow students 
              excel in their academic journey with curated study materials, practical resources, and exam preparation tools.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Ziora Special Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              What Makes Ziora Special
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover the unique features and advantages that set Ziora apart as the ultimate study companion for engineering students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Student-Centric Design */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Student-Centric Design</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Built by students, for students. We understand the real challenges and provide solutions that actually work.
              </p>
            </div>

            {/* Engineering Excellence */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <MdEngineering className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Engineering Excellence</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Specialized content for all engineering branches with detailed practicals and real-world applications.
              </p>
            </div>

            {/* Smart Learning */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <FaBrain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Smart Learning</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Organized content by semester and subject for structured learning and easy navigation.
              </p>
            </div>

            {/* Innovation First */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <FaLightbulb className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Innovation First</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Modern technology stack with cutting-edge features for enhanced learning experience.
              </p>
            </div>

            {/* Comprehensive Resources */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <FaGraduationCap className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Comprehensive Resources</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Everything you need: notes, video lectures, practicals, PYQs, and exam preparation materials.
              </p>
            </div>

            {/* Code Excellence */}
            <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-teal-100 dark:bg-teal-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <BiCodeAlt className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-center">Code Excellence</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Working code examples, practical implementations, and hands-on lab tutorials for better understanding.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-8 rounded-2xl border">
              <div className="flex items-center mb-6">
                <FaRocket className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Why Students Choose Ziora</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MdVideoLibrary className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Rich video content with detailed explanations and visual learning</p>
                </div>
                <div className="flex items-start">
                  <MdQuiz className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Exam-focused preparation with previous year questions and important topics</p>
                </div>
                <div className="flex items-start">
                  <MdSchool className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">University-aligned curriculum covering all major engineering branches</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-8 rounded-2xl border">
              <div className="flex items-center mb-6">
                <FaCode className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Built for the Future</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Open-source development with community contributions</p>
                </div>
                <div className="flex items-start">
                  <Rocket className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Regular updates with latest curriculum changes and improvements</p>
                </div>
                <div className="flex items-start">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">Free access to all resources with no hidden charges or subscriptions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              What Makes Ziora Special
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover the features that make Ziora the perfect study companion for engineering students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary rounded-full">
                      <feature.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Meet Our Founders
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The passionate engineering students and developers behind Ziora who are committed to transforming education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-6 relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-border group-hover:ring-primary/50 transition-all duration-300">
                      <img
                        src={founder.avatar}
                        alt={`${founder.name}'s profile picture`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                   
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">
                    {founder.name}
                  </CardTitle>
                  <p className="text-muted-foreground font-medium mb-4">
                    {founder.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {founder.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Specialties</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {founder.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Notable Projects</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {founder.projects.slice(0, 3).map((project, idx) => (
                        <div key={idx} className="font-mono bg-secondary px-2 py-1 rounded">
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="transition-colors"
                    >
                      <Link
                        href={founder.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Link>
                    </Button>

                    {founder.portfolio && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-colors"
                      >
                        <Link
                          href={founder.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Join thousands of engineering students who are already using Ziora to excel in their studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[oklch(0.205_0_0)] text-white hover:bg-gray-100 hover:text-black" asChild>
              <Link href="/select">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Subjects
              </Link>
            </Button>
            <Button size="lg" className="bg-[oklch(0.205_0_0)] text-white hover:bg-gray-100 hover:text-black" asChild>
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
