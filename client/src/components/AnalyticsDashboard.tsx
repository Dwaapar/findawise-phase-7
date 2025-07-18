import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp, 
  MousePointer, 
  Users, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsOverview {
  totalClicks: number;
  uniqueSessions: number;
  conversions: number;
  conversionRate: number;
  chartData: Array<{
    date: string;
    clicks: number;
    conversions: number;
  }>;
  topOffers: Array<{
    offerId: number;
    clickCount: number;
    lastClick: string;
  }>;
}

interface OfferWithStats {
  id: number;
  slug: string;
  title: string;
  category: string;
  emotion: string;
  commission: string;
  totalClicks: number;
  conversions: number;
  conversionRate: number;
  isActive: boolean;
}

interface AffiliateNetwork {
  id: number;
  slug: string;
  name: string;
  description: string;
  isActive: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch analytics overview
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['/api/analytics/overview', refreshKey],
    enabled: true,
  });

  // Fetch affiliate offers with stats
  const { data: offersData, isLoading: offersLoading, refetch: refetchOffers } = useQuery({
    queryKey: ['/api/affiliate/offers', refreshKey],
    enabled: true,
  });

  // Fetch affiliate networks
  const { data: networksData, isLoading: networksLoading, refetch: refetchNetworks } = useQuery({
    queryKey: ['/api/affiliate/networks', refreshKey],
    enabled: true,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchAnalytics();
    refetchOffers();
    refetchNetworks();
  };

  if (analyticsLoading || offersLoading || networksLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading affiliate analytics...</p>
        </div>
      </div>
    );
  }

  const analyticsData: AnalyticsOverview = analytics || {
    totalClicks: 0,
    uniqueSessions: 0,
    conversions: 0,
    conversionRate: 0,
    chartData: [],
    topOffers: []
  };

  const offers: OfferWithStats[] = offersData?.offers || [];
  const networks: AffiliateNetwork[] = networksData?.networks || [];

  // Calculate performance metrics
  const totalRevenue = offers.reduce((sum, offer) => {
    const commission = parseFloat(offer.commission?.replace(/[^\d.]/g, '') || '0');
    return sum + (offer.conversions * commission);
  }, 0);

  const averageConversionRate = offers.length > 0 
    ? offers.reduce((sum, offer) => sum + offer.conversionRate, 0) / offers.length 
    : 0;

  // Prepare chart data
  const categoryData = offers.reduce((acc, offer) => {
    const category = offer.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { name: category, clicks: 0, conversions: 0 };
    }
    acc[category].clicks += offer.totalClicks;
    acc[category].conversions += offer.conversions;
    return acc;
  }, {} as Record<string, any>);

  const categoryChartData = Object.values(categoryData);

  const emotionData = offers.reduce((acc, offer) => {
    const emotion = offer.emotion || 'neutral';
    if (!acc[emotion]) {
      acc[emotion] = { name: emotion, value: 0 };
    }
    acc[emotion].value += offer.totalClicks;
    return acc;
  }, {} as Record<string, any>);

  const emotionChartData = Object.values(emotionData);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Affiliate Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive performance tracking and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Badge variant="secondary">Last 30 Days</Badge>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Clicks</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analyticsData.totalClicks.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +12.5% from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MousePointer className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unique Sessions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analyticsData.uniqueSessions.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +8.3% from last month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Conversions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analyticsData.conversions}
                  </p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    -2.1% from last month
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {analyticsData.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    +0.5% from last month
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="offers">Offers Performance</TabsTrigger>
            <TabsTrigger value="networks">Networks</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Click Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Click Trends (Last 30 Days)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Clicks"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="conversions" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Conversions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Performance by Category</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
                      <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Emotion Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Clicks by Emotion Theme</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={emotionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {emotionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Performance Tab */}
          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Affiliate Offers Performance</span>
                  </span>
                  <Badge variant="outline">{offers.length} Active Offers</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Emotion</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold text-slate-800">{offer.title}</p>
                            <p className="text-sm text-slate-500">/{offer.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{offer.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`${
                              offer.emotion === 'trust' ? 'border-green-500 text-green-700' :
                              offer.emotion === 'excitement' ? 'border-yellow-500 text-yellow-700' :
                              offer.emotion === 'relief' ? 'border-purple-500 text-purple-700' :
                              offer.emotion === 'confidence' ? 'border-red-500 text-red-700' :
                              offer.emotion === 'calm' ? 'border-blue-500 text-blue-700' :
                              'border-gray-500 text-gray-700'
                            }`}
                          >
                            {offer.emotion}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {offer.totalClicks.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {offer.conversions}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={`${
                            offer.conversionRate >= 5 ? 'text-green-600' :
                            offer.conversionRate >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {offer.conversionRate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {offer.commission}
                        </TableCell>
                        <TableCell>
                          <Badge variant={offer.isActive ? "default" : "secondary"}>
                            {offer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/go/${offer.slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Networks Tab */}
          <TabsContent value="networks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Affiliate Networks</span>
                  </span>
                  <Badge variant="outline">{networks.length} Networks</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Network</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Active Offers</TableHead>
                      <TableHead className="text-right">Total Clicks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {networks.map((network) => {
                      const networkOffers = offers.filter(offer => offer.category === network.slug);
                      const totalClicks = networkOffers.reduce((sum, offer) => sum + offer.totalClicks, 0);
                      
                      return (
                        <TableRow key={network.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p className="font-semibold text-slate-800">{network.name}</p>
                              <p className="text-sm text-slate-500">/{network.slug}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {network.description}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {networkOffers.length}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {totalClicks.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={network.isActive ? "default" : "secondary"}>
                              {network.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Top Performing Offers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offers
                      .sort((a, b) => b.totalClicks - a.totalClicks)
                      .slice(0, 5)
                      .map((offer, index) => (
                        <div key={offer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{offer.title}</p>
                              <p className="text-sm text-slate-500">{offer.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-semibold">{offer.totalClicks}</p>
                            <p className="text-sm text-slate-500">clicks</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Best Converting Offers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {offers
                      .filter(offer => offer.totalClicks > 0)
                      .sort((a, b) => b.conversionRate - a.conversionRate)
                      .slice(0, 5)
                      .map((offer, index) => (
                        <div key={offer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-green-100 text-green-800' :
                              index === 1 ? 'bg-blue-100 text-blue-800' :
                              index === 2 ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{offer.title}</p>
                              <p className="text-sm text-slate-500">{offer.conversions} conversions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-semibold text-green-600">
                              {offer.conversionRate.toFixed(1)}%
                            </p>
                            <p className="text-sm text-slate-500">conv. rate</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Revenue & Performance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      ${totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700">Estimated Revenue</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {averageConversionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-blue-700">Avg. Conversion Rate</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {offers.filter(offer => offer.isActive).length}
                    </p>
                    <p className="text-sm text-purple-700">Active Offers</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {networks.filter(network => network.isActive).length}
                    </p>
                    <p className="text-sm text-yellow-700">Active Networks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;