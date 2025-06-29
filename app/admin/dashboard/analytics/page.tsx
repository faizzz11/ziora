'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  BarChart3, 
  Users, 
  MousePointer, 
  LogIn, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  FileDown
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPagesVisited: number;
  totalLogins: number;
  growthRate: number;
  popularSubjects: Array<{ name: string; pagesVisited: number; visits: number }>;
  monthlyData: Array<{ month: string; users: number; pagesVisited: number; logins: number }>;
  userGrowth: Array<{ month: string; growth: number }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        const result = await response.json();

        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Failed to load analytics'}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              onClick={() => router.push('/admin/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Analytics Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Monitor platform performance, user engagement, and content analytics
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+{analytics.growthRate}%</span>
                <span className="text-sm text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.activeUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+8.2%</span>
                <span className="text-sm text-muted-foreground ml-2">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pages Visited</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalPagesVisited.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+15.3%</span>
                <span className="text-sm text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Logins</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalLogins.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">+22.1%</span>
                <span className="text-sm text-muted-foreground ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Monthly Growth Chart */}
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-xl font-semibold text-foreground">Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-foreground w-12">{data.month}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Users</p>
                            <p className="text-sm font-semibold text-foreground">{data.users}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Pages Visited</p>
                            <p className="text-sm font-semibold text-foreground">{data.pagesVisited.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Logins</p>
                            <p className="text-sm font-semibold text-foreground">{data.logins.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Growth Trends */}
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-xl font-semibold text-foreground">User Growth Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.userGrowth.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg">
                    <span className="text-sm font-medium text-foreground">{data.month} 2024</span>
                    <div className="flex items-center space-x-2">
                      {data.growth > 10 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                      )}
                      <span className={`text-sm font-semibold ${data.growth > 10 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {data.growth > 0 ? '+' : ''}{data.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Subjects */}
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardHeader className="border-b border-border p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">Popular Subjects</CardTitle>
              <Badge variant="secondary">Top 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {analytics.popularSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{subject.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <MousePointer className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{subject.pagesVisited.toLocaleString()} pages</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{subject.visits.toLocaleString()} visits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{subject.pagesVisited.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">pages visited</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
