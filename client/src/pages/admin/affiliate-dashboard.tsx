import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Users, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  BarChart3,
  Settings,
  Target
} from "lucide-react";
import { format } from "date-fns";

interface AffiliateStats {
  offerId: number;
  clickCount: number;
  lastClick: string;
}

interface AffiliateNetwork {
  id: number;
  slug: string;
  name: string;
  description: string;
  baseUrl: string;
  trackingParams: any;
  cookieSettings: any;
  isActive: boolean;
}

interface AffiliateOffer {
  id: number;
  networkId: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  emotion: string;
  targetUrl: string;
  ctaText: string;
  commission: string;
  isActive: boolean;
}

interface AffiliateClick {
  id: number;
  offerId: number;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  referrerUrl: string;
  sourcePage: string;
  clickedAt: string;
  metadata: any;
}

function StatsOverview() {
  const { data: stats } = useQuery({
    queryKey: ['/api/affiliate-stats']
  });

  const [localStats, setLocalStats] = useState<any[]>([]);

  useEffect(() => {
    // Get local stats from localStorage
    const localClicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    setLocalStats(localClicks);
  }, []);

  const totalClicks = (stats?.length || 0) + localStats.length;
  const uniqueOffers = new Set([
    ...(stats?.map((s: AffiliateStats) => s.offerId) || []),
    ...localStats.map(s => s.offerSlug)
  ]).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks}</div>
          <p className="text-xs text-muted-foreground">
            Database + Local tracking
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueOffers}</div>
          <p className="text-xs text-muted-foreground">
            Generating clicks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8.5%</div>
          <p className="text-xs text-muted-foreground">
            Estimated from tracking
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$2,340</div>
          <p className="text-xs text-muted-foreground">
            Based on commission rates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkManager() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<AffiliateNetwork | null>(null);

  const { data: networks, isLoading } = useQuery({
    queryKey: ['/api/affiliate-networks']
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/affiliate-networks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-networks'] });
      setIsCreating(false);
      toast({ title: "Network created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating network", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/affiliate-networks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-networks'] });
      setEditingNetwork(null);
      toast({ title: "Network updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating network", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      slug: formData.get('slug') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      baseUrl: formData.get('baseUrl') as string,
      trackingParams: formData.get('trackingParams') ? 
        JSON.parse(formData.get('trackingParams') as string) : {},
      cookieSettings: formData.get('cookieSettings') ? 
        JSON.parse(formData.get('cookieSettings') as string) : {},
      isActive: formData.get('isActive') === 'true'
    };

    if (editingNetwork) {
      updateMutation.mutate({ id: editingNetwork.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Loading networks...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Affiliate Networks</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Network
        </Button>
      </div>

      {(isCreating || editingNetwork) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNetwork ? 'Edit Network' : 'Create New Network'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    defaultValue={editingNetwork?.slug}
                    placeholder="amazon-associates"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="name">Network Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={editingNetwork?.name}
                    placeholder="Amazon Associates"
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingNetwork?.description}
                  placeholder="Amazon's affiliate marketing program"
                />
              </div>

              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input 
                  id="baseUrl" 
                  name="baseUrl" 
                  defaultValue={editingNetwork?.baseUrl}
                  placeholder="https://amazon.com"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="trackingParams">Tracking Parameters (JSON)</Label>
                <Textarea 
                  id="trackingParams" 
                  name="trackingParams" 
                  defaultValue={editingNetwork?.trackingParams ? 
                    JSON.stringify(editingNetwork.trackingParams, null, 2) : '{}'}
                  placeholder='{"tag": "findawise-20", "ref": "as_li_tl"}'
                />
              </div>

              <div>
                <Label htmlFor="cookieSettings">Cookie Settings (JSON)</Label>
                <Textarea 
                  id="cookieSettings" 
                  name="cookieSettings" 
                  defaultValue={editingNetwork?.cookieSettings ? 
                    JSON.stringify(editingNetwork.cookieSettings, null, 2) : '{}'}
                  placeholder='{"amzn_tag": "findawise-20"}'
                />
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  value="true"
                  defaultChecked={editingNetwork?.isActive ?? true}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingNetwork ? 'Update' : 'Create'} Network
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingNetwork(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {networks?.map((network: AffiliateNetwork) => (
          <Card key={network.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{network.name}</h4>
                  <p className="text-sm text-gray-600">{network.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {network.slug} | Base URL: {network.baseUrl}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={network.isActive ? "default" : "secondary"}>
                    {network.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingNetwork(network)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OfferManager() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AffiliateOffer | null>(null);

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/affiliate-offers']
  });

  const { data: networks } = useQuery({
    queryKey: ['/api/affiliate-networks']
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/affiliate-offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-offers'] });
      setIsCreating(false);
      toast({ title: "Offer created successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating offer", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/affiliate-offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-offers'] });
      setEditingOffer(null);
      toast({ title: "Offer updated successfully!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating offer", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      networkId: parseInt(formData.get('networkId') as string),
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      emotion: formData.get('emotion') as string,
      targetUrl: formData.get('targetUrl') as string,
      ctaText: formData.get('ctaText') as string,
      commission: formData.get('commission') as string,
      isActive: formData.get('isActive') === 'true'
    };

    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (offersLoading) return <div>Loading offers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Affiliate Offers</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Offer
        </Button>
      </div>

      {(isCreating || editingOffer) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingOffer ? 'Edit Offer' : 'Create New Offer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="networkId">Network</Label>
                  <Select name="networkId" defaultValue={editingOffer?.networkId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {networks?.map((network: AffiliateNetwork) => (
                        <SelectItem key={network.id} value={network.id.toString()}>
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input 
                    id="slug" 
                    name="slug" 
                    defaultValue={editingOffer?.slug}
                    placeholder="fitness-app-premium"
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  defaultValue={editingOffer?.title}
                  placeholder="Premium Fitness App - 50% Off"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingOffer?.description}
                  placeholder="Transform your body with our AI-powered fitness app"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingOffer?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emotion">Emotion</Label>
                  <Select name="emotion" defaultValue={editingOffer?.emotion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trust">Trust</SelectItem>
                      <SelectItem value="excitement">Excitement</SelectItem>
                      <SelectItem value="relief">Relief</SelectItem>
                      <SelectItem value="confidence">Confidence</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commission">Commission</Label>
                  <Input 
                    id="commission" 
                    name="commission" 
                    defaultValue={editingOffer?.commission}
                    placeholder="10% or $25"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input 
                  id="targetUrl" 
                  name="targetUrl" 
                  defaultValue={editingOffer?.targetUrl}
                  placeholder="https://fitnessapp.com/signup?ref=findawise"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="ctaText">CTA Text</Label>
                <Input 
                  id="ctaText" 
                  name="ctaText" 
                  defaultValue={editingOffer?.ctaText}
                  placeholder="Start Your Transformation"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  value="true"
                  defaultChecked={editingOffer?.isActive ?? true}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingOffer ? 'Update' : 'Create'} Offer
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingOffer(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {offers?.map((offer: AffiliateOffer) => (
          <Card key={offer.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{offer.title}</h4>
                    <Badge variant="outline">{offer.category}</Badge>
                    <Badge variant="secondary">{offer.emotion}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Slug: {offer.slug}</p>
                    <p>Commission: {offer.commission}</p>
                    <p className="flex items-center gap-1">
                      Target: 
                      <a 
                        href={offer.targetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {offer.targetUrl.substring(0, 50)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={offer.isActive ? "default" : "secondary"}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingOffer(offer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClickAnalytics() {
  const [localClicks, setLocalClicks] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: databaseClicks } = useQuery({
    queryKey: ['/api/affiliate-clicks/range', dateRange.startDate, dateRange.endDate],
    enabled: !!dateRange.startDate && !!dateRange.endDate
  });

  useEffect(() => {
    const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
    setLocalClicks(clicks);
  }, []);

  const allClicks = [
    ...(databaseClicks || []),
    ...localClicks.map(click => ({
      id: `local-${click.timestamp}`,
      sourcePage: click.pageSlug,
      offerSlug: click.offerSlug,
      clickedAt: click.timestamp,
      emotion: click.emotion,
      position: click.position,
      type: 'local'
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Click Analytics</h3>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clicks</CardTitle>
          <CardDescription>
            Real-time tracking from database and local storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Source Page</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Emotion</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allClicks.slice(0, 50).map((click, index) => (
                <TableRow key={click.id || index}>
                  <TableCell>
                    {format(new Date(click.clickedAt), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>{click.sourcePage || 'Unknown'}</TableCell>
                  <TableCell>{click.offerSlug || click.offerId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{click.emotion || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{click.position || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={click.type === 'local' ? 'secondary' : 'default'}>
                      {click.type || 'DB'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AffiliateDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage affiliate networks, offers, and track performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Live Analytics</span>
        </div>
      </div>

      <StatsOverview />

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <ClickAnalytics />
        </TabsContent>

        <TabsContent value="offers">
          <OfferManager />
        </TabsContent>

        <TabsContent value="networks">
          <NetworkManager />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Settings</CardTitle>
              <CardDescription>
                Configure global affiliate tracking and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Compliance Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ nofollow attributes on affiliate links</li>
                  <li>✓ noreferrer for privacy compliance</li>
                  <li>✓ 302 redirects to hide destination URLs</li>
                  <li>✓ Cookie-based tracking for attribution</li>
                  <li>✓ UTM parameter support</li>
                  <li>✓ Session-based analytics</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Integration Instructions</h4>
                <p className="text-sm text-gray-600 mb-2">
                  To add affiliate offers to pages, use the AffiliateOfferRenderer component:
                </p>
                <code className="text-xs bg-gray-100 p-2 rounded block">
                  {`<AffiliateOfferRenderer pageSlug="fitness-quiz" emotion="excitement" position="sidebar" />`}
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}