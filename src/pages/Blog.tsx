
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink, Hash, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  platform: "medium";
  url: string;
  tags: string[];
  readTime: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: "2",
    title: "Building Scalable Microservices with Modern Patterns",
    excerpt: "A deep dive into microservices architecture patterns that actually work in production. Learn about event sourcing, CQRS, and distributed system challenges...",
    date: "2024-06-28",
    platform: "medium",
    url: "https://medium.com/@juanramos/microservices-patterns",
    tags: ["Microservices", "Architecture", "Scalability"],
    readTime: "8 min read"
  },
  {
    id: "4",
    title: "Machine Learning Operations: From Model to Production",
    excerpt: "The journey from a machine learning model in a Jupyter notebook to a production system serving millions of users. MLOps best practices and real-world challenges...",
    date: "2024-06-15",
    platform: "medium",
    url: "https://medium.com/@juanramos/mlops-production",
    tags: ["MLOps", "AI", "DevOps", "Production"],
    readTime: "10 min read"
  }
];

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const mediumResponse = await supabase.functions.invoke('fetch-medium-posts');

        let allPosts: BlogPost[] = [];

        if (mediumResponse.error) {
          console.warn('Medium posts failed to load:', mediumResponse.error);
          setError('Failed to load Medium posts');
          // Fallback to mock Medium posts only
          allPosts = mockBlogPosts.filter(post => post.platform === 'medium');
        } else if (mediumResponse.data?.posts) {
          allPosts = mediumResponse.data.posts;
        } else {
          // If no posts from API, use mock Medium posts
          allPosts = mockBlogPosts.filter(post => post.platform === 'medium');
        }

        // Sort posts by date (newest first)
        allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setPosts(allPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        // Fallback to mock Medium posts only
        setPosts(mockBlogPosts.filter(post => post.platform === 'medium'));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Juan's Blog</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Posts count */}
        <div className="flex items-center gap-2 mb-8">
          <Badge variant="secondary" className="text-sm">
            {posts.length} Medium {posts.length === 1 ? 'post' : 'posts'}
          </Badge>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-slate-600">Loading posts...</span>
          </div>
        )}

        {/* Blog posts grid */}
        {!loading && (
          <div className="space-y-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="group hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <span>•</span>
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Hash size={14} className="text-green-600" />
                        <span className="capitalize font-medium">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-700 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Read more button */}
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-sm group/link"
                >
                  <span>Read full article</span>
                  <ExternalLink size={14} className="group-hover/link:translate-x-0.5 transition-transform duration-200" />
                </a>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {/* No posts message */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">
              No Medium posts found.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
