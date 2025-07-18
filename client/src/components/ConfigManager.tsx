import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PageConfig, PagesConfig } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Download, 
  Upload,
  FileText,
  Settings,
  Palette,
  Zap
} from "lucide-react";

const ConfigManager = () => {
  const [pagesConfig, setPagesConfig] = useState<PagesConfig>({ pages: [] });
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);
  const [isNewPage, setIsNewPage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state for editing pages
  const [formData, setFormData] = useState<Partial<PageConfig>>({
    slug: "",
    title: "",
    description: "",
    niche: "",
    emotion: "",
    interactiveModule: "",
    contentPointer: "",
    cta: { text: "", link: "" },
    meta: { keywords: "", ogImage: "" }
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/src/config/pages.json');
      const config = await response.json();
      setPagesConfig(config);
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = () => {
    setIsNewPage(true);
    setEditingPage(null);
    setFormData({
      slug: "",
      title: "",
      description: "",
      niche: "",
      emotion: "",
      interactiveModule: "",
      contentPointer: "",
      cta: { text: "", link: "" },
      meta: { keywords: "", ogImage: "" }
    });
    setDialogOpen(true);
  };

  const handleEditPage = (page: PageConfig) => {
    setIsNewPage(false);
    setEditingPage(page);
    setFormData(page);
    setDialogOpen(true);
  };

  const handleDeletePage = (slug: string) => {
    const updatedPages = pagesConfig.pages.filter(p => p.slug !== slug);
    setPagesConfig({ pages: updatedPages });
    toast({
      title: "Success",
      description: "Page deleted successfully",
    });
  };

  const handleSavePage = () => {
    if (!formData.slug || !formData.title || !formData.description || !formData.niche || !formData.emotion) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const pageData = formData as PageConfig;
    
    if (isNewPage) {
      // Check if slug already exists
      if (pagesConfig.pages.some(p => p.slug === pageData.slug)) {
        toast({
          title: "Error",
          description: "A page with this slug already exists",
          variant: "destructive"
        });
        return;
      }
      
      setPagesConfig(prev => ({
        pages: [...prev.pages, pageData]
      }));
    } else {
      setPagesConfig(prev => ({
        pages: prev.pages.map(p => 
          p.slug === editingPage?.slug ? pageData : p
        )
      }));
    }

    setDialogOpen(false);
    toast({
      title: "Success",
      description: `Page ${isNewPage ? 'created' : 'updated'} successfully`,
    });
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(pagesConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'pages.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Success",
      description: "Configuration exported successfully",
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setPagesConfig(config);
        toast({
          title: "Success",
          description: "Configuration imported successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuration Manager</h2>
          <p className="text-slate-600">Manage your dynamic pages and settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import Config
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </label>
          <Button onClick={handleAddPage}>
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Pages</p>
                <p className="text-2xl font-bold">{pagesConfig.pages.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Modules</p>
                <p className="text-2xl font-bold">
                  {new Set(pagesConfig.pages.map(p => p.interactiveModule)).size}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Emotion Themes</p>
                <p className="text-2xl font-bold">
                  {new Set(pagesConfig.pages.map(p => p.emotion)).size}
                </p>
              </div>
              <Palette className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Niches</p>
                <p className="text-2xl font-bold">
                  {new Set(pagesConfig.pages.map(p => p.niche)).size}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pagesConfig.pages.map((page) => {
              const theme = emotionMap[page.emotion];
              return (
                <div key={page.slug} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{page.title}</h3>
                        <Badge variant="secondary">{page.niche}</Badge>
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: theme.background,
                            color: theme.text 
                          }}
                        >
                          {page.emotion}
                        </Badge>
                        <Badge variant="outline">{page.interactiveModule}</Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{page.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Slug: /{page.slug}</span>
                        <span>CTA: {page.cta.text}</span>
                        <span>Content: {page.contentPointer}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPage(page)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePage(page.slug)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {pagesConfig.pages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pages configured yet. Add your first page to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Page Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewPage ? 'Add New Page' : 'Edit Page'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateFormData('slug', e.target.value)}
                  placeholder="page-slug"
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Page Title"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Page description for SEO"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="niche">Niche *</Label>
                <Select value={formData.niche} onValueChange={(value) => updateFormData('niche', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="mental-health">Mental Health</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emotion">Emotion *</Label>
                <Select value={formData.emotion} onValueChange={(value) => updateFormData('emotion', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(emotionMap).map(([key, theme]) => (
                      <SelectItem key={key} value={key}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interactiveModule">Interactive Module</Label>
                <Select value={formData.interactiveModule} onValueChange={(value) => updateFormData('interactiveModule', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="calculator">Calculator</SelectItem>
                    <SelectItem value="comparison">Comparison</SelectItem>
                    <SelectItem value="timer">Timer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contentPointer">Content File Path</Label>
                <Input
                  id="contentPointer"
                  value={formData.contentPointer}
                  onChange={(e) => updateFormData('contentPointer', e.target.value)}
                  placeholder="content/page-content.md"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">Call to Action</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={formData.cta?.text}
                    onChange={(e) => updateNestedFormData('cta', 'text', e.target.value)}
                    placeholder="Get Started"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={formData.cta?.link}
                    onChange={(e) => updateNestedFormData('cta', 'link', e.target.value)}
                    placeholder="/signup"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">SEO Meta Data</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.meta?.keywords}
                    onChange={(e) => updateNestedFormData('meta', 'keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <Label htmlFor="ogImage">OG Image</Label>
                  <Input
                    id="ogImage"
                    value={formData.meta?.ogImage}
                    onChange={(e) => updateNestedFormData('meta', 'ogImage', e.target.value)}
                    placeholder="/images/og-image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSavePage}>
              <Save className="w-4 h-4 mr-2" />
              {isNewPage ? 'Create Page' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigManager;
