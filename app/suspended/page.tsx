'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Mail, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SuspensionData {
  status: string;
  reason: string;
  suspendedAt?: string;
  deletedAt?: string;
}

export default function SuspendedPage() {
  const [suspensionData, setSuspensionData] = useState<SuspensionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get suspension data from URL params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const reason = urlParams.get('reason');
    const suspendedAt = urlParams.get('suspendedAt');
    const deletedAt = urlParams.get('deletedAt');

    if (status) {
      setSuspensionData({
        status,
        reason: reason || 'No reason provided',
        suspendedAt: suspendedAt || undefined,
        deletedAt: deletedAt || undefined
      });
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isDeleted = suspensionData?.status === 'deleted';
  const isSuspended = suspensionData?.status === 'suspended';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-400">
            {isDeleted ? 'Account Deleted' : 'Account Suspended'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {isDeleted 
              ? 'Your account has been permanently deleted by our administrators.'
              : 'Your account has been temporarily suspended and cannot be accessed at this time.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Reason:</strong> {suspensionData?.reason || 'No reason provided'}
            </AlertDescription>
          </Alert>

          {(suspensionData?.suspendedAt || suspensionData?.deletedAt) && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Date:</strong> {' '}
                {new Date(suspensionData.suspendedAt || suspensionData.deletedAt!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </AlertDescription>
            </Alert>
          )}

          {!isDeleted && (
            <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Appeal Your Suspension
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                If you believe this suspension was made in error or would like to appeal this decision, 
                please contact our support team with your account details and an explanation.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  <strong>Email:</strong> appeal@ziora.com
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  <strong>Subject:</strong> Account Suspension Appeal - [Your Email]
                </p>
              </div>
            </div>
          )}

          {isDeleted && (
            <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Account Recovery
              </h3>
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                Your account has been permanently deleted. If you believe this was done in error, 
                please contact our support team immediately.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> support@ziora.com
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Subject:</strong> Account Recovery Request - [Your Email]
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center space-x-4">
          <Link href="/login">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.href = 'mailto:appeal@ziora.com?subject=Account%20Suspension%20Appeal'}
            className="flex items-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Appeal Email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 