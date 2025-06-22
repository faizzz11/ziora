'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background dark:bg-[oklch(0.181_0_0)] flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200 dark:text-white select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't worry, it happens to the best of us. Let's get you back on track.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transform hover:scale-105 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Homepage
                </Button>
              </Link>

              <Link href="/select">
                <Button 
                  variant="outline" 
                  className="border-border text-foreground hover:bg-secondary dark:hover:bg-[oklch(0.225_0_0)] transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Browse Courses
                </Button>
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Still can't find what you're looking for?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
                <Link 
                  href="/about" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Learn About Ziora
                </Link>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <button 
                  onClick={() => window.history.back()} 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Go Back
                </button>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Error Code: 404 • Page not found
          </p>
        </div>
      </div>
    </div>
  )
}
