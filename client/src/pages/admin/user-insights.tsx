import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { Users, MousePointer, Clock, TrendingUp, Activity, Brain, Target, Eye } from "lucide-react";
import { useState } from "react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function UserInsightsPage() {
  const [timeframe, setTimeframe] = useState('7d');

  // Fetch user insights data
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/admin/user-insights'],
    queryFn: async () => {
      const response = await fetch('/api/admin/user-insights');
      if (!response.ok) throw new Error('Failed to fetch user insights');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch behavior heatmap data
  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['/api/admin/behavior-heatmap', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/admin/behavior-heatmap?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch heatmap data');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch conversion flows
  const { data: conversionFlows, isLoading: flowsLoading } = useQuery({
    queryKey: ['/api/admin/conversion-flows'],
    queryFn: async () => {
      const response = await fetch('/api/admin/conversion-flows');
      if (!response.ok) throw new Error('Failed to fetch conversion flows');
      const result = await response.json();
      return result.data;
    }
  });

  const isLoading = insightsLoading || heatmapLoading || flowsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const sessionStats = insights?.sessionStats || {};
  const segmentDistribution = insights?.segmentDistribution || [];
  const behaviorStats = insights?.behaviorStats || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Insights Dashboard</h1>
          <p className="text-gray-600">Anonymous behavioral analytics and conversion intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Anonymous user sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Site</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(sessionStats.avgTimeOnSite / 1000 / 60) || 0}m
            </div>
            <p className="text-xs text-muted-foreground">Average session duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(sessionStats.avgPageViews) || 0}</div>
            <p className="text-xs text-muted-foreground">Pages per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interactions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(sessionStats.avgInteractions) || 0}</div>
            <p className="text-xs text-muted-foreground">User engagements per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="segments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Analysis</TabsTrigger>
          <TabsTrigger value="heatmap">Page Heatmap</TabsTrigger>
          <TabsTrigger value="conversions">Conversion Flows</TabsTrigger>
        </TabsList>

        {/* User Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  User Segment Distribution
                </CardTitle>
                <CardDescription>
                  How visitors are automatically categorized based on behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, count }) => `${segment.replace('_', ' ')}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {segmentDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Insights</CardTitle>
                <CardDescription>Understanding different user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentDistribution.map((segment: any, index: number) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="font-medium capitalize">
                            {segment.segment.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getSegmentDescription(segment.segment)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{segment.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Analysis Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Behavior Event Distribution
              </CardTitle>
              <CardDescription>
                Most common user interactions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={behaviorStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Page Performance Heatmap
              </CardTitle>
              <CardDescription>
                Page interaction intensity and scroll depth analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {heatmapData?.heatmapData && heatmapData.heatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={heatmapData.heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pageSlug" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No heatmap data available for the selected timeframe
                </div>
              )}
            </CardContent>
          </Card>

          {heatmapData?.scrollData && heatmapData.scrollData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scroll Depth Analytics</CardTitle>
                <CardDescription>How far users scroll on each page</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={heatmapData.scrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pageSlug" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgScrollDepth" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Conversion Flows Tab */}
        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                User Journey Analysis
              </CardTitle>
              <CardDescription>
                Understanding user paths and conversion patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionFlows?.userFlows && conversionFlows.userFlows.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Session Activity Distribution</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={conversionFlows.userFlows.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="sessionId" hide />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="eventCount" fill="#ff7300" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Total User Flows</span>
                          <span className="font-semibold">{conversionFlows.userFlows.length}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Avg Events per Session</span>
                          <span className="font-semibold">
                            {Math.round(conversionFlows.userFlows.reduce((acc: number, flow: any) => acc + flow.eventCount, 0) / conversionFlows.userFlows.length)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No conversion flow data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getSegmentDescription(segment: string): string {
  const descriptions: Record<string, string> = {
    new_visitor: "First-time visitors exploring the platform",
    returning_visitor: "Users who have visited before",
    engaged_user: "High interaction, multiple page views",
    high_converter: "Frequently clicks affiliate offers",
    researcher: "Spends time reading, low conversion",
    buyer: "Quick decision makers, high conversion rate"
  };
  
  return descriptions[segment] || "Unknown segment type";
}