import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DynamicPageGenerator from "@/components/DynamicPageGenerator";
import { PagesConfig, PageConfig } from "@/types/config";

const DynamicPage = () => {
  const { slug } = useParams();
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageConfig = async () => {
      try {
        const response = await fetch('/src/config/pages.json');
        if (!response.ok) {
          throw new Error('Failed to load pages configuration');
        }
        
        const config: PagesConfig = await response.json();
        const page = config.pages.find(p => p.slug === slug);
        
        if (!page) {
          setError(`Page with slug "${slug}" not found in configuration`);
        } else {
          setPageConfig(page);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadPageConfig();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !pageConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                <p className="text-sm text-gray-600 mt-2">
                  {error || 'The requested page could not be found'}
                </p>
              </div>
            </div>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DynamicPageGenerator pageConfig={pageConfig} />;
};

export default DynamicPage;
