import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { emotionMap } from "@/config/emotionMap";
import { PagesConfig } from "@/types/config";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { 
  FileText, 
  Settings, 
  Palette, 
  Zap,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  BookOpen,
  Wand2,
  BarChart3,
  FlaskConical,
  Mail
} from "lucide-react";

const Dashboard = () => {
  const [pagesConfig, setPagesConfig] = useState<PagesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('overview');
  const [location, navigate] = useLocation();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/src/config/pages.json');
        const config = await response.json();
        setPagesConfig(config);
      } catch (error) {
        console.error('Error loading pages config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = {
    totalPages: pagesConfig?.pages.length || 0,
    activeModules: new Set(pagesConfig?.pages.map(p => p.interactiveModule)).size || 0,
    emotionThemes: Object.keys(emotionMap).length,
    niches: new Set(pagesConfig?.pages.map(p => p.niche)).size || 0
  };

  // Show analytics dashboard if requested
  if (currentView === 'analytics') {
    return <AnalyticsDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-slate-200 z-50">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-800">Findawise Empire</h1>
          <p className="text-sm text-slate-600">Affiliate Management System</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setCurrentView('overview')}
                className={`w-full flex items-center px-4 py-3 text-slate-700 rounded-lg transition-colors ${
                  currentView === 'overview' ? 'bg-blue-50 border border-blue-200 font-medium' : 'hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentView('analytics')}
                className={`w-full flex items-center px-4 py-3 text-slate-700 rounded-lg transition-colors ${
                  currentView === 'analytics' ? 'bg-blue-50 border border-blue-200 font-medium' : 'hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </button>
            </li>
            <li>
              <Link href="/admin/experiments-dashboard">
                <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <FlaskConical className="w-5 h-5 mr-3" />
                  A/B Testing
                </div>
              </Link>
            </li>
            <li>
              <Link href="/admin/leads-dashboard">
                <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <Mail className="w-5 h-5 mr-3" />
                  Lead Management
                </div>
              </Link>
            </li>
            <li>
              <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <Settings className="w-5 h-5 mr-3" />
                Config Manager
              </div>
            </li>
            <li>
              <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <Palette className="w-5 h-5 mr-3" />
                Emotion Themes
              </div>
            </li>
            <li>
              <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <Zap className="w-5 h-5 mr-3" />
                Interactive Modules
              </div>
            </li>
            <li>
              <div className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <BookOpen className="w-5 h-5 mr-3" />
                Blog Manager
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Central Config + Dynamic Page Generator</h1>
          <p className="text-slate-600">Framework-independent, modular foundation for the Findawise Empire</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Pages</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalPages}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Modules</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.activeModules}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Emotion Themes</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.emotionThemes}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Niches</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.niches}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Pages Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Generated Pages Preview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pagesConfig?.pages.map((page) => {
              const theme = emotionMap[page.emotion];
              return (
                <Card key={page.slug} className="overflow-hidden">
                  <div 
                    className="p-6 text-white"
                    style={{ background: theme.gradient }}
                  >
                    <h3 className="text-xl font-bold mb-2">{page.title}</h3>
                    <p className="opacity-90 mb-4">{page.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {theme.name} Theme
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {page.interactiveModule} Module
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>Niche: {page.niche}</p>
                        <p>Emotion: {page.emotion}</p>
                      </div>
                      <Link href={`/page/${page.slug}`}>
                        <Button
                          size="sm"
                          style={{ 
                            background: theme.gradient,
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          View Page <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Emotion Theme System */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Emotion-Based Theme System</CardTitle>
              <p className="text-sm text-slate-600">Dynamic theming based on psychological triggers</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(emotionMap).map(([key, theme]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                      style={{ background: theme.gradient }}
                    ></div>
                    <h3 className="font-semibold text-slate-800">{theme.name}</h3>
                    <p className="text-sm text-slate-600">{theme.primary}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Modules System */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pluggable Interactive Modules</CardTitle>
              <p className="text-sm text-slate-600">Modular system for dynamic content interactions</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { name: "Quiz Module", icon: Users, description: "Interactive questionnaires with scoring" },
                  { name: "Calculator Module", icon: TrendingUp, description: "Dynamic calculation tools" },
                  { name: "Comparison Module", icon: Target, description: "Side-by-side comparisons" },
                  { name: "Timer Module", icon: Sparkles, description: "Countdown and meditation timers" }
                ].map((module, index) => (
                  <Card key={index} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <module.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800">{module.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
