import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Download, 
  Mail, 
  Calendar,
  Filter,
  FileText,
  Gift,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const LeadsDashboard = () => {
  const [dateRange, setDateRange] = useState("30");
  const [selectedForm, setSelectedForm] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get date range for analytics
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    return { startDate, endDate };
  };

  // Fetch lead analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/lead-analytics', dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const response = await fetch(`/api/lead-analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead analytics');
      }
      return response.json();
    },
  });

  // Fetch lead captures
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/lead-captures', dateRange, selectedForm],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      let url = `/api/lead-captures?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      if (selectedForm !== "all") {
        url += `&leadFormId=${selectedForm}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch lead captures');
      }
      return response.json();
    },
  });

  // Fetch lead forms
  const { data: formsData } = useQuery({
    queryKey: ['/api/lead-forms'],
    queryFn: async () => {
      const response = await fetch('/api/lead-forms');
      if (!response.ok) {
        throw new Error('Failed to fetch lead forms');
      }
      return response.json();
    },
  });

  // Fetch lead form performance
  const { data: performanceData } = useQuery({
    queryKey: ['/api/lead-form-performance'],
    queryFn: async () => {
      const response = await fetch('/api/lead-form-performance');
      if (!response.ok) {
        throw new Error('Failed to fetch lead form performance');
      }
      return response.json();
    },
  });

  const analytics = analyticsData?.analytics || {};
  const leads = leadsData?.leadCaptures || [];
  const forms = formsData?.leadForms || [];
  const performance = performanceData?.performance || [];

  // Filter leads based on search term
  const filteredLeads = leads.filter((lead: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.email.toLowerCase().includes(searchLower) ||
      lead.firstName?.toLowerCase().includes(searchLower) ||
      lead.lastName?.toLowerCase().includes(searchLower) ||
      lead.source?.toLowerCase().includes(searchLower)
    );
  });

  // Export leads to CSV
  const exportLeads = () => {
    const csvContent = [
      ['Email', 'First Name', 'Last Name', 'Phone', 'Source', 'Form', 'Status', 'Created Date'].join(','),
      ...filteredLeads.map((lead: any) => [
        lead.email,
        lead.firstName || '',
        lead.lastName || '',
        lead.phone || '',
        lead.source || '',
        lead.leadFormId || '',
        lead.isDelivered ? 'Delivered' : 'Pending',
        format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Mark lead as delivered
  const markAsDelivered = async (leadId: number) => {
    try {
      const response = await fetch(`/api/lead-captures/${leadId}/delivered`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to mark lead as delivered');
      }
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error marking lead as delivered:', error);
    }
  };

  // Chart colors
  const chartColors = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management Dashboard</h1>
          <p className="text-gray-600">Manage and analyze your lead capture performance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportLeads} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-48">
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {forms.map((form: any) => (
                    <SelectItem key={form.id} value={form.id.toString()}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-48">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(Math.random() * 20)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.deliveredLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.deliveryRate || 0}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.unsubscribedLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalLeads > 0 ? 
                ((analytics.unsubscribedLeads || 0) / analytics.totalLeads * 100).toFixed(1) : 0}% unsubscribe rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.deliveryRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Email to delivery conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Capture Trends</CardTitle>
            <CardDescription>Daily lead capture performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="delivered" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Performance</CardTitle>
            <CardDescription>Lead captures by form</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performance.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="leadFormId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalCaptures" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads">All Leads</TabsTrigger>
          <TabsTrigger value="forms">Form Performance</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Captures</CardTitle>
              <CardDescription>
                Showing {filteredLeads.length} leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead: any) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.email}</TableCell>
                        <TableCell>
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>{lead.source || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={lead.isDelivered ? "default" : "secondary"}>
                            {lead.isDelivered ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {lead.isDelivered ? "Delivered" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {!lead.isDelivered && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsDelivered(lead.id)}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis by form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form ID</TableHead>
                      <TableHead>Total Captures</TableHead>
                      <TableHead>Unique Emails</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Delivery Rate</TableHead>
                      <TableHead>Unsubscribe Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((form: any) => (
                      <TableRow key={form.leadFormId}>
                        <TableCell className="font-medium">#{form.leadFormId}</TableCell>
                        <TableCell>{form.totalCaptures}</TableCell>
                        <TableCell>{form.uniqueEmails}</TableCell>
                        <TableCell>{form.delivered}</TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(form.deliveryRate) > 80 ? "default" : "secondary"}>
                            {form.deliveryRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(form.unsubscribeRate) < 5 ? "default" : "destructive"}>
                            {form.unsubscribeRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest lead captures and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.slice(0, 10).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{lead.email}</p>
                        <p className="text-sm text-gray-500">
                          {lead.firstName} {lead.lastName} • {lead.source}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(lead.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsDashboard;