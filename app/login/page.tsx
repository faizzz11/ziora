"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import PageTracker from '@/components/PageTracker';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Username/Email validation
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid username/email or password');
      }
      
      // Store user data in localStorage or state management solution
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'An error occurred during login' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
      return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="bg-white dark:bg-[oklch(0.205_0_0)] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-800">
                  Welcome Back!
                </h3>
                <p className="text-sm text-gray-600">
                  {successMessage}
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <PageTracker pageName="Login" />
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Ziora
            </h1>
          </Link>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white dark:bg-[oklch(0.205_0_0)] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader className="text-center mb-8 p-0">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email Field */}
              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username or Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="Enter your username or email"
                    value={formData.usernameOrEmail}
                    onChange={(e) => handleInputChange('usernameOrEmail', e.target.value)}
                    className={`pl-10 h-12 rounded-2xl ${errors.usernameOrEmail ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.usernameOrEmail && <p className="text-sm text-red-600">{errors.usernameOrEmail}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-12 rounded-2xl ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end dark:text-gray-50">
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-black hover:text-gray-700 transition-colors dark:text-gray-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* General Error */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center ">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="px-2 bg-white text-gray-500 dark:bg-[oklch(0.205_0_0)] dark:text-gray-300">Don't have an account?</span>
                </div>
              </div>

              {/* Create Account Link */}
              <div className="text-center">
                <Link 
                  href="/signup"
                  className="inline-flex items-center justify-center w-full h-12 text-lg font-semibold text-black bg-gray-100 rounded-2xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-300 border border-gray-300"
                >
                  Create a new account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Protected by Ziora Security • Safe and Secure Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
