"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp' | 'success'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateCredentials = () => {
    if (formData.username === 'zero' && formData.password === 'zeroktfc') {
      return true;
    }
    return false;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (validateCredentials()) {
      setStep('otp');
    } else {
      setError('Invalid username or password. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleRequestOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: formData.username, 
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: formData.username, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Store admin session data
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      // Also store as regular user session for app compatibility
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setStep('success');
      
      // Redirect to select page after successful admin login
      setTimeout(() => {
        window.location.href = '/select';
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCredentialsStep = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !formData.username || !formData.password}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Verifying...</span>
          </div>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <div className="space-y-6">
      {!otpSent ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verify Your Identity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We need to send a verification code to all authorized admin emails for security.
            </p>
          </div>
          <Button
            onClick={handleRequestOTP}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              'Send OTP to Admin Emails'
            )}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Enter Verification Code
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We've sent a 6-digit code to all authorized admin email addresses. Check any of the admin emails for the code.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || formData.otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Login'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOtpSent(false);
                setFormData(prev => ({ ...prev, otp: '' }));
              }}
              className="w-full text-sm"
            >
              Request New Code
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
          <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
          Login Successful!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Welcome back, Admin. Redirecting to your dashboard...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ziora Admin
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'credentials' && 'Administrator Login'}
              {step === 'otp' && 'Two-Factor Authentication'}
              {step === 'success' && 'Access Granted'}
            </h2>
            <p className="text-gray-600">
              {step === 'credentials' && 'Enter your admin credentials to continue'}
              {step === 'otp' && 'Complete the verification process'}
              {step === 'success' && 'Successfully authenticated'}
            </p>
          </div>
          
          {step === 'credentials' && renderCredentialsStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'success' && renderSuccessStep()}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Protected by Ziora Security • Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
