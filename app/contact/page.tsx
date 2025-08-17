"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Users } from 'lucide-react';
import { FaPhone, FaEnvelope, FaLocationArrow, FaPaperPlane } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn, MdMessage } from 'react-icons/md';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/animate-ui/Navbar';
import PageTracker from '@/components/PageTracker';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccessMessage('Thank you for your message! We will get back to you soon.');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone Number',
      value: '+91 82918 06658',
      description: 'Call us for immediate assistance',
      href: 'tel:+919136261589'
    },
    {
      icon: FaEnvelope,
      title: 'Email Address',
      value: 'ziora.education@gmail.com',
      description: 'Send us an email for detailed queries',
      href: 'mailto:ziora.education@gmail.com'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: '24-48 Hours',
      description: 'We typically respond within 1-2 days',
      href: null
    }
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'Quick Response',
      description: 'We respond to all messages within 24-48 hours'
    },
    {
      icon: Users,
      title: 'Student Support',
      description: 'Dedicated support team for student queries'
    },
    {
      icon: FaLocationArrow,
      title: 'Direct Access',
      description: 'Direct line to our development team'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
      <PageTracker pageName="Contact" />
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium mb-4">
              Contact Us
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Get in Touch with Ziora
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Have questions about our platform? Need help with your studies? 
              Our team is here to support you on your educational journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Contact Information
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Reach out to us through any of these channels. We're always happy to help!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <info.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground mb-2">
                    {info.title}
                  </CardTitle>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {info.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {info.href && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="transition-colors"
                    >
                      <Link href={info.href}>
                        Contact Now
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Send Us a Message Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MdMessage className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Send Us a Message
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a specific question or feedback? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-6 border-2">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                  <FaPaperPlane className="w-5 h-5 mr-2 text-primary" />
                  Message Form
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {/* Success Message */}
                {successMessage && (
                  <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* General Error */}
                {errors.general && (
                  <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Your first name"
                        className="w-full"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                      {errors.firstName && (
                        <Alert className="mt-2">
                          <AlertDescription>{errors.firstName}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Your last name"
                        className="w-full"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                      {errors.lastName && (
                        <Alert className="mt-2">
                          <AlertDescription>{errors.lastName}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    {errors.email && (
                      <Alert className="mt-2">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What is your message about?"
                      className="w-full"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                    {errors.subject && (
                      <Alert className="mt-2">
                        <AlertDescription>{errors.subject}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your query or feedback..."
                      className="w-full min-h-[120px]"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                    {errors.message && (
                      <Alert className="mt-2">
                        <AlertDescription>{errors.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button type="submit" className="w-full cursor-pointer" size="lg" disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Why Contact Us */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-6 rounded-2xl border">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  Why Contact Us?
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <feature.icon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Contact Card */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <MdPhone className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Admin Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-3" />
                      <span className="font-mono text-foreground">+91 9136261589</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-3" />
                      <span className="font-mono text-foreground">ziora.education@gmail.com</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Direct contact with our admin team for urgent matters and administrative queries.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <div className="bg-card dark:bg-[oklch(0.205_0_0)] p-6 rounded-2xl border">
                <h3 className="text-lg font-bold text-foreground mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Be specific about your issue for faster resolution</li>
                  <li>• Include your student ID if applicable</li>
                  <li>• Check our FAQ section before contacting</li>
                  <li>• For urgent matters, call our admin number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Don't let questions hold you back. Reach out to us today and let's solve them together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[oklch(0.205_0_0)] text-white hover:bg-gray-100 hover:text-black" asChild>
              <Link href="mailto:ziora.education@gmail.com">
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Link>
            </Button>
            <Button size="lg" className="bg-[oklch(0.205_0_0)] text-white hover:bg-gray-100 hover:text-black" asChild>
              <Link href="tel:+919136261589">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;