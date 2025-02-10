'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  BarChart3,
  Clock,
  Settings,
  Users,
  ArrowUpRight,
  FileUp
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function Dashboard() {
  const [recentActivity] = useState([
    { type: 'cv_analysis', title: 'Resume Analysis Completed', time: '2 hours ago' },
    { type: 'chat_convert', title: 'Chat Converted to PDF', time: '5 hours ago' },
    { type: 'cv_upload', title: 'New CV Uploaded', time: '1 day ago' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, User</h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your documents.</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/tools/chat-converter">
                Convert Chat
              </Link>
            </Button>
            <Button asChild>
              <Link href="/tools/resume-analyzer">
                Analyze CV
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CVs Analyzed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Chats Converted</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +3 from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45%</div>
              <p className="text-xs text-muted-foreground">
                of 1GB quota
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start using our tools</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/tools/resume-analyzer" className="flex items-center">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload New CV
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/tools/chat-converter" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Convert Chat History
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Settings
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest document activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 rounded-lg border p-3"
                  >
                    {activity.type === 'cv_analysis' && (
                      <FileText className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.type === 'chat_convert' && (
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    )}
                    {activity.type === 'cv_upload' && (
                      <FileUp className="h-5 w-5 text-purple-500" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Insights</CardTitle>
            <CardDescription>View your tool usage and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week" className="space-y-4">
              <TabsList>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="year">This Year</TabsTrigger>
              </TabsList>
              <TabsContent value="week" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Analyses
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4</div>
                      <p className="text-xs text-muted-foreground">
                        +1 from last week
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Processing Time
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2.5m</div>
                      <p className="text-xs text-muted-foreground">
                        Average per document
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}