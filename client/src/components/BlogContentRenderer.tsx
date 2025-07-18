import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { PageConfig } from "@/types/config";
import { emotionMap } from "@/config/emotionMap";
import { 
  FileText, 
  Clock, 
  User, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface BlogContentRendererProps {
  pageConfig: PageConfig;
  className?: string;
  userSegment?: string;
  recommendations?: any;
}

const BlogContentRenderer = ({ 
  pageConfig, 
  className = "",
  userSegment,
  recommendations 
}: BlogContentRendererProps) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    wordCount: number;
    readingTime: number;
    lastUpdated: string;
  } | null>(null);

  const theme = emotionMap[pageConfig.emotion];

  useEffect(() => {
    const loadBlogContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load content from the specified file path
        const response = await fetch(`/src/${pageConfig.contentPointer}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        
        const markdownContent = await response.text();
        setContent(markdownContent);
        
        // Calculate metadata
        const words = markdownContent.split(/\s+/).length;
        const readingTime = Math.ceil(words / 200); // Average reading speed
        
        setMetadata({
          wordCount: words,
          readingTime,
          lastUpdated: new Date().toLocaleDateString()
        });
        
      } catch (err) {
        console.error('Error loading blog content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setContent(`# ${pageConfig.title}\n\n*Content file not found at: ${pageConfig.contentPointer}*\n\nThis usually means the blog content hasn't been generated yet. Use the Blog Manager to create content for this page.`);
      } finally {
        setLoading(false);
      }
    };

    if (pageConfig.contentPointer) {
      loadBlogContent();
    } else {
      setContent(`# ${pageConfig.title}\n\n*No content file specified for this page.*`);
      setLoading(false);
    }
  }, [pageConfig]);

  if (loading) {
    return (
      <Card className={`${className} animate-fade-in`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} animate-fade-in`} style={{ borderColor: theme.primary }}>
      {/* Blog Header */}
      <CardHeader style={{ backgroundColor: theme.background }} className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: theme.primary }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color: theme.text }}>
                Blog Content
              </CardTitle>
              <p className="text-sm text-gray-600">
                {pageConfig.niche} • {theme.name} Theme
              </p>
            </div>
          </div>
          
          {metadata && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {metadata.readingTime} min read
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {metadata.wordCount} words
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Blog Content */}
      <CardContent className="p-0">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              // Custom styling for markdown elements based on emotion theme
              h1: ({ children }) => (
                <h1 
                  className="text-3xl font-bold mb-6 pt-8 pb-4 border-b"
                  style={{ 
                    color: theme.text,
                    borderColor: theme.primary 
                  }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 
                  className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2"
                  style={{ color: theme.text }}
                >
                  <ChevronRight 
                    className="w-6 h-6" 
                    style={{ color: theme.primary }} 
                  />
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 
                  className="text-xl font-medium mb-3 mt-6"
                  style={{ color: theme.text }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-gray-700">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-none space-y-2 mb-4">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2">
                  <span 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-gray-700">{children}</span>
                </li>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote 
                  className="border-l-4 pl-6 py-4 my-6 italic"
                  style={{ 
                    borderColor: theme.primary,
                    backgroundColor: theme.background 
                  }}
                >
                  {children}
                </blockquote>
              ),
              code: ({ inline, children }) => (
                inline ? (
                  <code 
                    className="px-2 py-1 rounded text-sm font-mono"
                    style={{ 
                      backgroundColor: theme.background,
                      color: theme.text 
                    }}
                  >
                    {children}
                  </code>
                ) : (
                  <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                    {children}
                  </code>
                )
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-gray-300">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th 
                  className="border border-gray-300 px-4 py-2 text-left font-semibold"
                  style={{ 
                    backgroundColor: theme.background,
                    color: theme.text 
                  }}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 px-4 py-2">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong style={{ color: theme.text }}>
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em style={{ color: theme.secondary }}>
                  {children}
                </em>
              ),
              a: ({ href, children }) => (
                <a 
                  href={href}
                  className="inline-flex items-center gap-1 hover:underline"
                  style={{ color: theme.primary }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        {/* Content Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text 
                }}
              >
                {pageConfig.niche}
              </Badge>
              <Badge 
                variant="outline"
                style={{ borderColor: theme.primary }}
              >
                {theme.name} Theme
              </Badge>
              {error && (
                <Badge variant="destructive">
                  Content Error
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Content
              </Button>
              <Button
                size="sm"
                style={{ 
                  background: theme.gradient,
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => window.location.href = pageConfig.cta.link}
              >
                {pageConfig.cta.text}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogContentRenderer;