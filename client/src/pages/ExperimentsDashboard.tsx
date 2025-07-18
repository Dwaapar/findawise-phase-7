import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Plus, Play, Pause, Eye, MousePointer, Zap, Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Experiment {
  id: number;
  slug: string;
  name: string;
  description: string;
  type: string;
  targetEntity: string;
  trafficAllocation: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ExperimentVariant {
  id: number;
  experimentId: number;
  slug: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: any;
  isControl: boolean;
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    clickRate: string;
    conversionRate: string;
  };
}

interface ExperimentAnalytics {
  experiment: Experiment;
  variants: ExperimentVariant[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    topPerformingVariant: ExperimentVariant;
  };
}

export function ExperimentsDashboard() {
  const [selectedExperiment, setSelectedExperiment] = useState<number | null>(null);
  const [newExperimentOpen, setNewExperimentOpen] = useState(false);
  const [newVariantOpen, setNewVariantOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all experiments
  const { data: experiments = [], isLoading: experimentsLoading } = useQuery({
    queryKey: ['/api/experiments'],
  });

  // Fetch analytics for selected experiment
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/experiments', selectedExperiment, 'analytics'],
    enabled: !!selectedExperiment,
  });

  // Create experiment mutation
  const createExperimentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create experiment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiments'] });
      setNewExperimentOpen(false);
      toast({ title: 'Success', description: 'Experiment created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create experiment', variant: 'destructive' });
    },
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/experiment-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create variant');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiments', selectedExperiment, 'analytics'] });
      setNewVariantOpen(false);
      toast({ title: 'Success', description: 'Variant created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create variant', variant: 'destructive' });
    },
  });

  // Update experiment status mutation
  const updateExperimentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update experiment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiments'] });
      toast({ title: 'Success', description: 'Experiment status updated' });
    },
  });

  const handleCreateExperiment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      slug: formData.get('slug'),
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type'),
      targetEntity: formData.get('targetEntity'),
      trafficAllocation: parseInt(formData.get('trafficAllocation') as string),
      status: 'draft',
      createdBy: 'admin',
    };
    createExperimentMutation.mutate(data);
  };

  const handleCreateVariant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const configuration = {
      title: formData.get('variantTitle'),
      description: formData.get('variantDescription'),
      ctaText: formData.get('ctaText'),
      color: formData.get('color'),
    };
    
    const data = {
      experimentId: selectedExperiment,
      slug: formData.get('variantSlug'),
      name: formData.get('variantName'),
      description: formData.get('variantDescription'),
      trafficPercentage: parseInt(formData.get('trafficPercentage') as string),
      configuration,
      isControl: formData.get('isControl') === 'on',
    };
    createVariantMutation.mutate(data);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Experiments Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">A/B testing and experimentation control center</p>
          </div>
          <Dialog open={newExperimentOpen} onOpenChange={setNewExperimentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Experiment</DialogTitle>
                <DialogDescription>Set up a new A/B test experiment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateExperiment} className="space-y-4">
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input name="slug" placeholder="homepage-hero-test" required />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input name="name" placeholder="Homepage Hero A/B Test" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea name="description" placeholder="Testing different hero section variants" />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experiment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="cta">CTA Button</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetEntity">Target Entity</Label>
                  <Input name="targetEntity" placeholder="homepage, fitness-quiz, etc." required />
                </div>
                <div>
                  <Label htmlFor="trafficAllocation">Traffic Allocation (%)</Label>
                  <Input name="trafficAllocation" type="number" min="1" max="100" defaultValue="100" required />
                </div>
                <Button type="submit" className="w-full" disabled={createExperimentMutation.isPending}>
                  {createExperimentMutation.isPending ? 'Creating...' : 'Create Experiment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{experiments.length}</div>
              <p className="text-xs text-muted-foreground">
                {experiments.filter((e: Experiment) => e.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experiments.filter((e: Experiment) => e.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Running now</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.variants?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Across all experiments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.variants?.length > 0 
                  ? (analytics.variants.reduce((sum: number, v: ExperimentVariant) => 
                      sum + parseFloat(v.metrics?.conversionRate?.replace('%', '') || '0'), 0) / analytics.variants.length).toFixed(2)
                  : '0.00'}%
              </div>
              <p className="text-xs text-muted-foreground">Current selection</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="experiments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="experiments" className="space-y-6">
            {/* Experiments List */}
            <Card>
              <CardHeader>
                <CardTitle>All Experiments</CardTitle>
                <CardDescription>Manage your A/B tests and experiments</CardDescription>
              </CardHeader>
              <CardContent>
                {experimentsLoading ? (
                  <div className="text-center py-8">Loading experiments...</div>
                ) : experiments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No experiments yet. Create your first A/B test!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiments.map((experiment: Experiment) => (
                      <div 
                        key={experiment.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedExperiment === experiment.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedExperiment(experiment.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{experiment.name}</h3>
                              <Badge variant={experiment.status === 'active' ? 'default' : 'secondary'}>
                                {experiment.status}
                              </Badge>
                              <Badge variant="outline">{experiment.type}</Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{experiment.description}</p>
                            <div className="text-sm text-gray-500">
                              Target: {experiment.targetEntity} • Traffic: {experiment.trafficAllocation}%
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateExperimentMutation.mutate({
                                  id: experiment.id,
                                  status: experiment.status === 'active' ? 'paused' : 'active'
                                });
                              }}
                            >
                              {experiment.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {selectedExperiment ? (
              <>
                {analyticsLoading ? (
                  <div className="text-center py-8">Loading analytics...</div>
                ) : analytics ? (
                  <>
                    {/* Experiment Header */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{analytics.experiment.name}</CardTitle>
                            <CardDescription>{analytics.experiment.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={analytics.experiment.status === 'active' ? 'default' : 'secondary'}>
                              {analytics.experiment.status}
                            </Badge>
                            <Dialog open={newVariantOpen} onOpenChange={setNewVariantOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Variant
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create New Variant</DialogTitle>
                                  <DialogDescription>Add a new test variant to this experiment</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateVariant} className="space-y-4">
                                  <div>
                                    <Label htmlFor="variantSlug">Variant Slug</Label>
                                    <Input name="variantSlug" placeholder="variant-b" required />
                                  </div>
                                  <div>
                                    <Label htmlFor="variantName">Variant Name</Label>
                                    <Input name="variantName" placeholder="Variant B" required />
                                  </div>
                                  <div>
                                    <Label htmlFor="variantDescription">Description</Label>
                                    <Input name="variantDescription" placeholder="Alternative design" />
                                  </div>
                                  <div>
                                    <Label htmlFor="trafficPercentage">Traffic Percentage</Label>
                                    <Input name="trafficPercentage" type="number" min="1" max="100" defaultValue="50" required />
                                  </div>
                                  <div>
                                    <Label htmlFor="variantTitle">Title Text</Label>
                                    <Input name="variantTitle" placeholder="New headline" />
                                  </div>
                                  <div>
                                    <Label htmlFor="ctaText">CTA Text</Label>
                                    <Input name="ctaText" placeholder="Get Started Now" />
                                  </div>
                                  <div>
                                    <Label htmlFor="color">Color Theme</Label>
                                    <Select name="color">
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select color" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="blue">Blue</SelectItem>
                                        <SelectItem value="green">Green</SelectItem>
                                        <SelectItem value="red">Red</SelectItem>
                                        <SelectItem value="purple">Purple</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input type="checkbox" name="isControl" id="isControl" />
                                    <Label htmlFor="isControl">Mark as control variant</Label>
                                  </div>
                                  <Button type="submit" className="w-full" disabled={createVariantMutation.isPending}>
                                    {createVariantMutation.isPending ? 'Creating...' : 'Create Variant'}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{analytics.summary.totalImpressions}</div>
                            <div className="text-sm text-gray-500">Total Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{analytics.summary.totalClicks}</div>
                            <div className="text-sm text-gray-500">Total Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{analytics.summary.totalConversions}</div>
                            <div className="text-sm text-gray-500">Total Conversions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                              {analytics.summary.topPerformingVariant?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">Top Performer</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Variants Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Variant Performance</CardTitle>
                          <CardDescription>Conversion rates by variant</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.variants}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="metrics.impressions" fill="#8884d8" name="Impressions" />
                              <Bar dataKey="metrics.clicks" fill="#82ca9d" name="Clicks" />
                              <Bar dataKey="metrics.conversions" fill="#ffc658" name="Conversions" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Traffic Distribution</CardTitle>
                          <CardDescription>How traffic is split between variants</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={analytics.variants}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, trafficPercentage }) => `${name}: ${trafficPercentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="trafficPercentage"
                              >
                                {analytics.variants.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Variant Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {analytics.variants.map((variant: ExperimentVariant, index: number) => (
                        <Card key={variant.id} className={variant.isControl ? 'border-blue-200 bg-blue-50 dark:bg-blue-950' : ''}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {variant.name}
                              {variant.isControl && <Badge variant="outline">Control</Badge>}
                              {analytics.summary.topPerformingVariant?.id === variant.id && (
                                <Badge className="bg-yellow-500">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{variant.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Traffic Split</span>
                                <span className="font-medium">{variant.trafficPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Impressions
                                </span>
                                <span className="font-medium">{variant.metrics?.impressions || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <MousePointer className="w-3 h-3 mr-1" />
                                  Clicks
                                </span>
                                <span className="font-medium">{variant.metrics?.clicks || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Conversions
                                </span>
                                <span className="font-medium">{variant.metrics?.conversions || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Click Rate</span>
                                <span className="font-medium text-green-600">{variant.metrics?.clickRate || '0.00%'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Conversion Rate</span>
                                <span className="font-medium text-blue-600">{variant.metrics?.conversionRate || '0.00%'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No analytics data available
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select an experiment to view analytics
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}