"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setCurrentStep('otp');
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOTP()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setCurrentStep('password');
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to verify OTP. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setCurrentStep('success');
      
      // Redirect to login after success
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to reset password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleRequestOTP} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`pl-10 h-12 rounded-2xl ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
            required
          />
        </div>
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      {errors.general && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Sending OTP...</span>
          </div>
        ) : (
          'Request OTP'
        )}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <Shield className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Check Your Email
        </h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to <span className="font-medium">{formData.email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
          Verification Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="otp"
          type="text"
          placeholder="Enter 6-digit code"
          value={formData.otp}
          onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={`text-center text-lg tracking-widest h-12 rounded-2xl ${errors.otp ? 'border-red-300 focus:border-red-500' : ''}`}
          maxLength={6}
          required
        />
        {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>}
      </div>

      {errors.general && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          disabled={isLoading || formData.otp.length !== 6}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify Code'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentStep('email')}
          className="w-full text-sm text-gray-600 hover:text-gray-800"
        >
          Didn't receive the code? Try again
        </Button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center">
          <Lock className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Create New Password
        </h3>
        <p className="text-sm text-gray-600">
          Your identity has been verified. Please create a new secure password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            New Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Create a new password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`pl-10 pr-10 h-12 rounded-2xl ${errors.newPassword ? 'border-red-300 focus:border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm New Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`pl-10 pr-10 h-12 rounded-2xl ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      {errors.general && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold text-white bg-black rounded-2xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Resetting Password...</span>
          </div>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-800">
          Password Reset Successful!
        </h3>
        <p className="text-sm text-gray-600">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
      <p className="text-xs text-gray-500">
        Redirecting to login page...
      </p>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Reset Your Password';
      case 'otp':
        return 'Verify Your Identity';
      case 'password':
        return 'Create New Password';
      case 'success':
        return 'Password Reset Complete';
      default:
        return 'Reset Your Password';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'Enter your email address and we\'ll send you a verification code';
      case 'otp':
        return 'Enter the verification code to proceed';
      case 'password':
        return 'Choose a strong password for your account';
      case 'success':
        return 'Your password has been successfully updated';
      default:
        return 'Enter your email address and we\'ll send you a verification code';
    }
  };

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="bg-white dark:bg-[oklch(0.205_0_0)] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
            {renderSuccessStep()}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Ziora
            </h1>
          </Link>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Secure password recovery
          </p>
        </div>

        {/* Reset Password Card */}
        <Card className="bg-white dark:bg-[oklch(0.205_0_0)] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader className="text-center mb-8 p-0">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'otp' && renderOTPStep()}
            {currentStep === 'password' && renderPasswordStep()}

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-300 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Protected by Ziora Security • Safe Password Recovery
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
