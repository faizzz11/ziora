'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Eye, 
  MousePointer, 
  Code, 
  Copy,
  Printer,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  User,
  Clock,
  MapPin,
  Monitor
} from "lucide-react";

interface SecurityEvent {
  _id: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  eventType: 'screenshot_attempt' | 'right_click' | 'dev_tools_open' | 'copy_attempt' | 'print_attempt';
  page: string;
  pagePath: string;
  timestamp: string;
  details?: {
    method?: string;
    keyPressed?: string;
    browserInfo?: string;
    deviceInfo?: string;
    platform?: string;
    screenResolution?: string;
    windowSize?: string;
  };
}

interface SecurityStats {
  total: number;
  byType: {
    [key: string]: {
      count: number;
      lastEvent: string;
    };
  };
}

export default function SecurityPage() {
  const router = useRouter();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  
  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [userEmailFilter, setUserEmailFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Verify admin status on component mount
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const adminData = localStorage.getItem('admin');
        const userData = localStorage.getItem('user');
        
        if (!adminData && !userData) {
          router.push('/admin');
          return;
        }

        const response = await fetch('/api/security/events');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin');
            return;
          }
        }

        setIsVerifyingAdmin(false);
      } catch (error) {
        console.error('Admin verification error:', error);
        router.push('/admin');
      }
    };

    verifyAdminAccess();
  }, [router]);

  // Fetch security events
  const fetchSecurityEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(eventTypeFilter !== 'all' && { eventType: eventTypeFilter }),
        ...(userEmailFilter && { userEmail: userEmailFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/security/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setStats(data.statistics);
      } else {
        setError(data.error || 'Failed to fetch security events');
      }
    } catch (error) {
      setError('Error fetching security events');
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifyingAdmin) return;
    fetchSecurityEvents();
  }, [isVerifyingAdmin, currentPage, eventTypeFilter, userEmailFilter, startDate, endDate]);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'screenshot_attempt':
        return <Eye className="h-4 w-4" />;
      case 'right_click':
        return <MousePointer className="h-4 w-4" />;
      case 'dev_tools_open':
        return <Code className="h-4 w-4" />;
      case 'copy_attempt':
        return <Copy className="h-4 w-4" />;
      case 'print_attempt':
        return <Printer className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'screenshot_attempt':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'right_click':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'dev_tools_open':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'copy_attempt':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'print_attempt':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleRefresh = () => {
    fetchSecurityEvents();
  };

  const handleClearFilters = () => {
    setEventTypeFilter('all');
    setUserEmailFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Show loading state while verifying admin access
  if (isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Security Monitoring</h1>
            <p className="text-lg text-muted-foreground">
              Monitor and track security events across the platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Screenshots</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.byType.screenshot_attempt?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Right Clicks</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.byType.right_click?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <MousePointer className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dev Tools</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.byType.dev_tools_open?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Copy Attempts</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.byType.copy_attempt?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Copy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="screenshot_attempt">Screenshot Attempts</SelectItem>
                  <SelectItem value="right_click">Right Clicks</SelectItem>
                  <SelectItem value="dev_tools_open">Dev Tools</SelectItem>
                  <SelectItem value="copy_attempt">Copy Attempts</SelectItem>
                  <SelectItem value="print_attempt">Print Attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                placeholder="Filter by user email"
                value={userEmailFilter}
                onChange={(e) => setUserEmailFilter(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleClearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No security events found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-4 border border-border rounded-lg bg-secondary dark:bg-[oklch(0.185_0_0)] hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <Badge className={`${getEventTypeColor(event.eventType)} flex items-center space-x-1`}>
                          {getEventTypeIcon(event.eventType)}
                          <span>{formatEventType(event.eventType)}</span>
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              {event.userEmail || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <span className="text-sm text-foreground font-medium">Page: </span>
                          <span className="text-sm text-muted-foreground">{event.page}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.ipAddress}</span>
                          </div>
                          {event.details?.method && (
                            <div className="flex items-center space-x-1">
                              <Monitor className="h-3 w-3" />
                              <span>Method: {event.details.method}</span>
                            </div>
                          )}
                          {event.details?.platform && (
                            <div className="flex items-center space-x-1">
                              <span>Platform: {event.details.platform}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 