import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PagesConfig, PageConfig } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  Plus, 
  Edit2, 
  Eye, 
  Download, 
  Upload, 
  Wand2,
  Sparkles,
  BookOpen,
  RefreshCw,
  Save,
  Trash2
} from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  content: string;
  wordCount: number;
  lastModified: string;
  emotion: string;
  niche: string;
}

const BlogManager = () => {
  const [pagesConfig, setPagesConfig] = useState<PagesConfig>({ pages: [] });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Auto-generation settings
  const [generateSettings, setGenerateSettings] = useState({
    selectedPage: "",
    contentType: "comprehensive",
    tone: "professional",
    length: "medium",
    includeExamples: true,
    includeTips: true,
    includeConclusion: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load pages configuration
      const pagesResponse = await fetch('/src/config/pages.json');
      const pagesData = await pagesResponse.json();
      setPagesConfig(pagesData);

      // Load existing blog posts
      const posts: BlogPost[] = [];
      for (const page of pagesData.pages) {
        if (page.contentPointer) {
          try {
            const contentResponse = await fetch(`/src/${page.contentPointer}`);
            if (contentResponse.ok) {
              const content = await contentResponse.text();
              posts.push({
                slug: page.slug,
                title: page.title,
                content,
                wordCount: content.split(/\s+/).length,
                lastModified: new Date().toISOString(),
                emotion: page.emotion,
                niche: page.niche
              });
            }
          } catch (error) {
            console.log(`No content found for ${page.slug}`);
          }
        }
      }
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load blog data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBlogContent = async (pageConfig: PageConfig) => {
    setGenerating(true);
    
    try {
      // Generate content based on page configuration
      const generatedContent = await generateMarkdownContent(pageConfig);
      
      // Save the generated content
      await saveBlogContent(pageConfig.slug, generatedContent);
      
      toast({
        title: "Success",
        description: "Blog content generated successfully",
      });
      
      // Refresh the posts
      await loadData();
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate blog content",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setGenerateDialogOpen(false);
    }
  };

  const generateMarkdownContent = async (pageConfig: PageConfig): Promise<string> => {
    // AI-powered content generation based on page config
    const theme = emotionMap[pageConfig.emotion];
    const prompts = {
      comprehensive: "Create a comprehensive, detailed guide",
      howto: "Create a step-by-step how-to guide",
      tips: "Create a list of practical tips and strategies",
      overview: "Create an informative overview"
    };

    const lengthGuides = {
      short: "Keep it concise, around 500-800 words",
      medium: "Make it detailed, around 1200-1500 words",
      long: "Make it comprehensive, around 2000-2500 words"
    };

    // Mock AI generation - in production, this would call OpenAI API
    const mockContent = `# ${pageConfig.title}

## Introduction

${pageConfig.description}

Welcome to your comprehensive guide on ${pageConfig.title.toLowerCase()}. This guide is designed with a ${theme.name.toLowerCase()} approach to help you achieve your goals in the ${pageConfig.niche} niche.

## Key Principles

### 1. Understanding the Fundamentals
Every successful journey starts with understanding the basics. In ${pageConfig.niche}, this means:

- **Foundation Building**: Establishing a solid base of knowledge
- **Goal Setting**: Defining clear, achievable objectives
- **Progress Tracking**: Monitoring your advancement

### 2. Practical Implementation
Theory without practice is meaningless. Here's how to apply these concepts:

- **Daily Actions**: Small, consistent steps toward your goal
- **Weekly Reviews**: Regular assessment of progress
- **Monthly Adjustments**: Fine-tuning your approach

### 3. Advanced Strategies
Once you've mastered the basics, these advanced techniques will accelerate your progress:

- **Optimization**: Streamlining your processes
- **Innovation**: Trying new approaches
- **Scaling**: Expanding your efforts

## Step-by-Step Guide

### Step 1: Assessment
Begin by evaluating your current situation:

1. **Current State Analysis**: Where are you now?
2. **Goal Identification**: Where do you want to be?
3. **Gap Analysis**: What needs to change?

### Step 2: Planning
Create a detailed roadmap:

1. **Timeline Creation**: Set realistic deadlines
2. **Resource Allocation**: Identify what you need
3. **Risk Assessment**: Plan for potential obstacles

### Step 3: Execution
Put your plan into action:

1. **Daily Implementation**: Focus on consistent action
2. **Progress Monitoring**: Track your advancement
3. **Adjustment Strategy**: Adapt as needed

## Expert Tips and Strategies

### Quick Wins
- **Tip 1**: Start with the easiest wins to build momentum
- **Tip 2**: Focus on high-impact, low-effort activities first
- **Tip 3**: Celebrate small victories along the way

### Common Mistakes to Avoid
- **Mistake 1**: Trying to do everything at once
- **Mistake 2**: Ignoring feedback and data
- **Mistake 3**: Giving up too early

### Advanced Techniques
- **Technique 1**: Use the 80/20 principle to focus on what matters most
- **Technique 2**: Implement feedback loops for continuous improvement
- **Technique 3**: Network with others in your field

## Case Studies and Examples

### Success Story 1: The Beginner's Journey
A complete beginner transformed their situation in just 90 days by:
- Following a structured plan
- Staying consistent despite challenges
- Seeking help when needed

### Success Story 2: The Advanced Practitioner
An experienced individual achieved breakthrough results by:
- Implementing advanced strategies
- Optimizing their existing processes
- Scaling their efforts strategically

## Tools and Resources

### Essential Tools
- **Tool 1**: Primary resource for getting started
- **Tool 2**: Advanced tool for optimization
- **Tool 3**: Analytics tool for tracking progress

### Recommended Reading
- **Book 1**: Foundational knowledge
- **Book 2**: Advanced strategies
- **Book 3**: Inspiration and motivation

### Online Resources
- **Website 1**: Comprehensive tutorials
- **Website 2**: Community support
- **Website 3**: Latest industry news

## Measuring Success

### Key Metrics
Track these important indicators:
- **Metric 1**: Primary success indicator
- **Metric 2**: Secondary progress marker
- **Metric 3**: Long-term impact measure

### Regular Reviews
- **Weekly**: Check short-term progress
- **Monthly**: Assess medium-term goals
- **Quarterly**: Evaluate overall strategy

## Troubleshooting Common Issues

### Issue 1: Lack of Progress
**Symptoms**: No visible improvement after significant effort
**Solutions**: 
- Review your approach
- Seek expert guidance
- Adjust your strategy

### Issue 2: Overwhelming Complexity
**Symptoms**: Feeling lost or confused
**Solutions**:
- Break down into smaller steps
- Focus on one thing at a time
- Seek simplification

### Issue 3: Loss of Motivation
**Symptoms**: Decreased enthusiasm and effort
**Solutions**:
- Remember your why
- Celebrate small wins
- Connect with others

## Advanced Optimization

### Performance Enhancement
- **Strategy 1**: Streamline your workflow
- **Strategy 2**: Eliminate inefficiencies
- **Strategy 3**: Automate repetitive tasks

### Scaling Strategies
- **Approach 1**: Gradual expansion
- **Approach 2**: Strategic partnerships
- **Approach 3**: System optimization

## Future Considerations

### Emerging Trends
Stay ahead by watching these developments:
- **Trend 1**: New technologies in the field
- **Trend 2**: Changing user preferences
- **Trend 3**: Industry evolution

### Continuous Learning
- **Resource 1**: Professional development courses
- **Resource 2**: Industry conferences
- **Resource 3**: Networking opportunities

## Conclusion

${pageConfig.title} requires dedication, strategy, and consistent action. By following this comprehensive guide, you'll be well-equipped to achieve your goals in ${pageConfig.niche}.

Remember:
- **Start Small**: Begin with manageable steps
- **Stay Consistent**: Regular action beats perfect action
- **Keep Learning**: Continuously improve your approach
- **Seek Support**: Don't hesitate to ask for help

Your journey in ${pageConfig.niche} starts now. Take the first step and begin implementing these strategies today.

---

*Ready to take action? Use our interactive ${pageConfig.interactiveModule} above to get personalized recommendations for your specific situation.*`;

    return mockContent;
  };

  const saveBlogContent = async (slug: string, content: string) => {
    // In a real implementation, this would save to the server
    // For now, we'll simulate saving by updating the local state
    const newPost: BlogPost = {
      slug,
      title: pagesConfig.pages.find(p => p.slug === slug)?.title || slug,
      content,
      wordCount: content.split(/\s+/).length,
      lastModified: new Date().toISOString(),
      emotion: pagesConfig.pages.find(p => p.slug === slug)?.emotion || 'trust',
      niche: pagesConfig.pages.find(p => p.slug === slug)?.niche || 'general'
    };

    setBlogPosts(prev => {
      const filtered = prev.filter(p => p.slug !== slug);
      return [...filtered, newPost];
    });
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setEditingContent(post.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;

    await saveBlogContent(selectedPost.slug, editingContent);
    setEditDialogOpen(false);
    setSelectedPost(null);
    setEditingContent("");
    
    toast({
      title: "Success",
      description: "Blog post updated successfully",
    });
  };

  const handleDeletePost = (slug: string) => {
    setBlogPosts(prev => prev.filter(p => p.slug !== slug));
    toast({
      title: "Success",
      description: "Blog post deleted successfully",
    });
  };

  const exportBlogContent = () => {
    const exportData = {
      posts: blogPosts,
      config: pagesConfig,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'blog-content-export.json');
    linkElement.click();
    
    toast({
      title: "Success",
      description: "Blog content exported successfully",
    });
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
          <h2 className="text-2xl font-bold text-slate-800">Blog Content Manager</h2>
          <p className="text-slate-600">Generate, edit, and manage blog content for your pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBlogContent}>
            <Download className="w-4 h-4 mr-2" />
            Export Content
          </Button>
          <Button onClick={() => setGenerateDialogOpen(true)}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Posts</p>
                <p className="text-2xl font-bold">{blogPosts.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Words</p>
                <p className="text-2xl font-bold">
                  {blogPosts.reduce((sum, post) => sum + post.wordCount, 0).toLocaleString()}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Missing Content</p>
                <p className="text-2xl font-bold">
                  {pagesConfig.pages.length - blogPosts.length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Words/Post</p>
                <p className="text-2xl font-bold">
                  {blogPosts.length > 0 ? Math.round(blogPosts.reduce((sum, post) => sum + post.wordCount, 0) / blogPosts.length) : 0}
                </p>
              </div>
              <Edit2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blogPosts.map((post) => {
              const theme = emotionMap[post.emotion];
              const readingTime = Math.ceil(post.wordCount / 200);
              
              return (
                <div key={post.slug} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: theme.background,
                            color: theme.text 
                          }}
                        >
                          {post.emotion}
                        </Badge>
                        <Badge variant="outline">{post.niche}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{post.wordCount} words</span>
                        <span>{readingTime} min read</span>
                        <span>Updated: {new Date(post.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.slug)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {blogPosts.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No blog posts found. Generate content to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Content Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Blog Content</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="selectedPage">Select Page</Label>
              <Select value={generateSettings.selectedPage} onValueChange={(value) => setGenerateSettings(prev => ({ ...prev, selectedPage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a page" />
                </SelectTrigger>
                <SelectContent>
                  {pagesConfig.pages.map(page => (
                    <SelectItem key={page.slug} value={page.slug}>
                      {page.title} ({page.niche})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={generateSettings.contentType} onValueChange={(value) => setGenerateSettings(prev => ({ ...prev, contentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Guide</SelectItem>
                    <SelectItem value="howto">How-To Guide</SelectItem>
                    <SelectItem value="tips">Tips & Strategies</SelectItem>
                    <SelectItem value="overview">Overview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Content Length</Label>
                <Select value={generateSettings.length} onValueChange={(value) => setGenerateSettings(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (500-800 words)</SelectItem>
                    <SelectItem value="medium">Medium (1200-1500 words)</SelectItem>
                    <SelectItem value="long">Long (2000+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  const selectedPage = pagesConfig.pages.find(p => p.slug === generateSettings.selectedPage);
                  if (selectedPage) {
                    generateBlogContent(selectedPage);
                  }
                }}
                disabled={!generateSettings.selectedPage || generating}
                className="flex-1"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Content: {selectedPost?.title}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="space-y-4">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="Enter your markdown content here..."
                className="min-h-[500px] font-mono text-sm"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {editingContent.split(/\s+/).length} words • {Math.ceil(editingContent.split(/\s+/).length / 200)} min read
                </p>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="prose prose-lg max-w-none border rounded-lg p-6">
                <ReactMarkdown>{editingContent}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManager;