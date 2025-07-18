/**
 * Cross-Device Analytics Dashboard
 * Comprehensive admin interface for analytics, user profiles, and cross-device tracking
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Users, Smartphone, Monitor, TrendingUp, Download, RefreshCw, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Types
interface GlobalUserProfile {
  id: number;
  uuid: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  totalSessions: number;
  totalPageViews: number;
  totalInteractions: number;
  conversionCount: number;
  lifetimeValue: number;
  firstVisit: Date;
  lastVisit: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AnalyticsEvent {
  id: number;
  sessionId: string;
  globalUserId?: number;
  eventType: string;
  eventAction: string;
  pageSlug?: string;
  deviceType?: string;
  serverTimestamp: Date;
  metadata?: Record<string, any>;
}

interface DeviceFingerprint {
  id: number;
  fingerprint: string;
  globalUserId: number;
  deviceInfo: Record<string, any>;
  browserInfo: Record<string, any>;
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
}

interface DashboardFilters {
  startDate: string;
  endDate: string;
  eventType?: string;
  deviceType?: string;
  globalUserId?: number;
}

const CrossDeviceAnalyticsDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.deviceType) params.append('deviceType', filters.deviceType);
      if (filters.globalUserId) params.append('globalUserId', filters.globalUserId.toString());
      
      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    }
  });

  const { data: crossDeviceStats } = useQuery({
    queryKey: ['cross-device-stats'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/cross-device-stats');
      if (!response.ok) throw new Error('Failed to fetch cross-device stats');
      return response.json();
    }
  });

  const { data: userProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['user-profiles', searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/analytics/user-profiles/search/${encodeURIComponent(searchQuery)}`
        : '/api/analytics/user-profiles?limit=50';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch user profiles');
      return response.json();
    }
  });

  const { data: userJourney } = useQuery({
    queryKey: ['user-journey', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const response = await fetch(`/api/analytics/user-journey/${selectedUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user journey');
      return response.json();
    },
    enabled: !!selectedUserId
  });

  const { data: engagementMetrics } = useQuery({
    queryKey: ['engagement-metrics', filters.globalUserId],
    queryFn: async () => {
      const params = filters.globalUserId ? `?globalUserId=${filters.globalUserId}` : '';
      const response = await fetch(`/api/analytics/engagement-metrics${params}`);
      if (!response.ok) throw new Error('Failed to fetch engagement metrics');
      return response.json();
    }
  });

  const { data: conversionFunnel } = useQuery({
    queryKey: ['conversion-funnel'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/conversion-funnel');
      if (!response.ok) throw new Error('Failed to fetch conversion funnel');
      return response.json();
    }
  });

  // Mutations
  const mergeProfilesMutation = useMutation({
    mutationFn: async ({ masterProfileId, mergedProfileId, reason }: {
      masterProfileId: number;
      mergedProfileId: number;
      reason: string;
    }) => {
      const response = await fetch('/api/analytics/merge-user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterProfileId, mergedProfileId, reason, confidence: 90 })
      });
      if (!response.ok) throw new Error('Failed to merge profiles');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['cross-device-stats'] });
    }
  });

  // Handlers
  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.deviceType) params.append('deviceType', filters.deviceType);
      if (filters.globalUserId) params.append('globalUserId', filters.globalUserId.toString());
      
      const response = await fetch(`/api/analytics/export/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['cross-device-stats'] });
    queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cross-Device Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm" disabled={exportLoading}>
            <Download className="h-4 w-4 mr-2" />
            {exportLoading ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={filters.eventType || ''} onValueChange={(value) => handleFilterChange('eventType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  <SelectItem value="page">Page Views</SelectItem>
                  <SelectItem value="interaction">Interactions</SelectItem>
                  <SelectItem value="conversion">Conversions</SelectItem>
                  <SelectItem value="user">User Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={filters.deviceType || ''} onValueChange={(value) => handleFilterChange('deviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Devices</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="globalUserId">User ID</Label>
              <Input
                id="globalUserId"
                type="number"
                placeholder="Filter by user ID"
                value={filters.globalUserId || ''}
                onChange={(e) => handleFilterChange('globalUserId', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardLoading ? (
            <div className="text-center py-8">Loading dashboard data...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.analytics?.summary?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {crossDeviceStats?.stats?.crossDeviceRate || 0}% cross-device users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.analytics?.summary?.totalSessions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Avg {dashboardData?.analytics?.summary?.avgEventsPerUser || 0} events/user
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.analytics?.summary?.totalEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Events tracked across all devices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Device Count</CardTitle>
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{crossDeviceStats?.stats?.totalDevices || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {crossDeviceStats?.stats?.avgDevicesPerUser || 0} avg devices/user
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData?.analytics?.charts?.eventsByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Events by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.analytics?.charts?.eventsByType || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData?.analytics?.charts?.eventsByDevice || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(dashboardData?.analytics?.charts?.eventsByDevice || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profiles</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by email, name, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="text-center py-8">Loading user profiles...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User ID</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Sessions</th>
                        <th className="text-left p-2">Page Views</th>
                        <th className="text-left p-2">Conversions</th>
                        <th className="text-left p-2">Last Visit</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userProfiles?.profiles || []).map((profile: GlobalUserProfile) => (
                        <tr key={profile.id} className="border-b">
                          <td className="p-2">{profile.id}</td>
                          <td className="p-2">{profile.email || 'N/A'}</td>
                          <td className="p-2">
                            {profile.firstName && profile.lastName 
                              ? `${profile.firstName} ${profile.lastName}`
                              : 'N/A'
                            }
                          </td>
                          <td className="p-2">{profile.totalSessions || 0}</td>
                          <td className="p-2">{profile.totalPageViews || 0}</td>
                          <td className="p-2">{profile.conversionCount || 0}</td>
                          <td className="p-2">
                            {profile.lastVisit ? new Date(profile.lastVisit).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-2">
                            <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                              {profile.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUserId(profile.id)}
                            >
                              View Journey
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Device Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{crossDeviceStats?.stats?.totalUsers || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{crossDeviceStats?.stats?.totalDevices || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Devices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{crossDeviceStats?.stats?.usersWithMultipleDevices || 0}</div>
                  <div className="text-sm text-muted-foreground">Multi-Device Users</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Cross-Device Rate</div>
                <Progress value={parseFloat(crossDeviceStats?.stats?.crossDeviceRate || '0')} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {crossDeviceStats?.stats?.crossDeviceRate || 0}% of users use multiple devices
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Engagement Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Avg Events per Session:</span>
                      <span className="font-medium">{engagementMetrics?.metrics?.avgEventsPerSession || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Session Duration:</span>
                      <span className="font-medium">{engagementMetrics?.metrics?.avgSessionDuration || 0}s</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Event Types</h4>
                  <div className="space-y-2">
                    {(engagementMetrics?.metrics?.eventTypes || []).map((eventType: any) => (
                      <div key={eventType.eventType} className="flex justify-between">
                        <span>{eventType.eventType}:</span>
                        <span className="font-medium">{eventType.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          {selectedUserId ? (
            <Card>
              <CardHeader>
                <CardTitle>User Journey - User ID: {selectedUserId}</CardTitle>
              </CardHeader>
              <CardContent>
                {userJourney?.journey ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userJourney.journey.summary.totalEvents}</div>
                        <div className="text-sm text-muted-foreground">Total Events</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userJourney.journey.summary.deviceCount}</div>
                        <div className="text-sm text-muted-foreground">Devices Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{userJourney.journey.summary.sessionCount}</div>
                        <div className="text-sm text-muted-foreground">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {userJourney.journey.summary.firstEvent 
                            ? Math.ceil((new Date().getTime() - new Date(userJourney.journey.summary.firstEvent).getTime()) / (1000 * 60 * 60 * 24))
                            : 0
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">Days Active</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-4">Recent Journey Steps</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {userJourney.journey.journeySteps.map((step: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">{step.eventType}</Badge>
                              <span className="font-medium">{step.eventAction}</span>
                              {step.pageSlug && (
                                <Badge variant="secondary">{step.pageSlug}</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(step.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">Loading user journey...</div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a user from the Users tab to view their journey
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionFunnel?.funnel ? (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold">{conversionFunnel.funnel.overallConversionRate}%</div>
                    <div className="text-sm text-muted-foreground">Overall Conversion Rate</div>
                  </div>
                  
                  <div className="space-y-3">
                    {conversionFunnel.funnel.funnelSteps.map((step: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{step.step}</div>
                            <div className="text-sm text-muted-foreground">{step.eventType}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{step.count}</div>
                          <div className="text-sm text-muted-foreground">
                            {step.conversionRate} conversion rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">Loading conversion funnel...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossDeviceAnalyticsDashboard;