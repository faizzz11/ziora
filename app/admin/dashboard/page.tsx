'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  MousePointer,
  LogIn,
  ShieldAlert
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const dashboardCards = [
    {
      title: "Analytics",
      description: "Monitor platform activity, user engagement, and content performance",
      icon: BarChart3,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      route: "/admin/dashboard/analytics",
      stats: [
        { label: "Total Users", value: "1,247", icon: Users },
        { label: "Pages Visited", value: "67.8K", icon: MousePointer },
        { label: "Total Logins", value: "23.5K", icon: LogIn },
        { label: "Growth", value: "+12.5%", icon: TrendingUp }
      ]
    },
    {
      title: "Comments Monitoring",
      description: "Review and moderate user comments and feedback across all content",
      icon: MessageSquare,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-900",
      route: "/admin/dashboard/comments",
      stats: [
        { label: "Total Comments", value: "2,834" },
        { label: "Pending Review", value: "23" },
        { label: "Approved Today", value: "67" },
        { label: "Flagged", value: "3" }
      ]
    },
    {
      title: "Users Management",
      description: "Manage user accounts and monitor user activity",
      icon: Users,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900",
      route: "/admin/dashboard/users",
      stats: [
        { label: "Total Users", value: "1,247" },
        { label: "Active Users", value: "832" },
        { label: "New This Week", value: "24" },
        { label: "Suspended", value: "3" }
      ]
    },
    {
      title: "State Management",
      description: "View and manage suspended and deleted user accounts",
      icon: ShieldAlert,
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-900",
      route: "/admin/dashboard/state",
      stats: [
        { label: "Suspended", value: "3" },
        { label: "Deleted", value: "1" },
        { label: "Appeals", value: "0" },
        { label: "Restored", value: "2" }
      ]
    }
  ];

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor and manage your educational platform
          </p>
        </div>

        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={index} 
                className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleCardClick(card.route)}
              >
                <CardHeader className="border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-foreground">
                          {card.title}
                        </CardTitle>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {card.stats.map((stat, statIndex) => {
                      const StatIcon = (stat as any).icon;
                      return (
                        <div key={statIndex} className="p-3 bg-secondary dark:bg-[oklch(0.185_0_0)] rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            {StatIcon && <StatIcon className="h-3 w-3 text-muted-foreground" />}
                            <span className="text-xs font-medium text-muted-foreground">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {stat.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card.route);
                      }}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="p-4 h-auto flex-col space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Add New User</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col space-y-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm">Review Comments</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col space-y-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">View Reports</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex-col space-y-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
