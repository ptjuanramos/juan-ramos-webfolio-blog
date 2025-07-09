
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink, Hash, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  platform: "linkedin" | "medium";
  url: string;
  tags: string[];
  readTime: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Software Architecture",
    excerpt: "Exploring how artificial intelligence is revolutionizing the way we design and build software systems. From automated code generation to intelligent system monitoring...",
    date: "2024-07-05",
    platform: "linkedin",
    url: "https://linkedin.com/in/juan-ramos/posts/ai-architecture",
    tags: ["AI", "Architecture", "Software Engineering"],
    readTime: "5 min read"
  },
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
    id: "3",
    title: "Why Clean Code Matters More Than Ever",
    excerpt: "In an era of rapid development and AI-assisted coding, the principles of clean code become even more critical. Here's why maintainability trumps speed...",
    date: "2024-06-20",
    platform: "linkedin",
    url: "https://linkedin.com/in/juan-ramos/posts/clean-code",
    tags: ["Clean Code", "Best Practices", "Software Engineering"],
    readTime: "4 min read"
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
  },
  {
    id: "5",
    title: "The Art of Technical Leadership",
    excerpt: "Moving from individual contributor to technical leader requires more than just coding skills. Leadership lessons learned from building and scaling engineering teams...",
    date: "2024-06-10",
    platform: "linkedin",
    url: "https://linkedin.com/in/juan-ramos/posts/technical-leadership",
    tags: ["Leadership", "Management", "Career"],
    readTime: "6 min read"
  }
];

const Blog = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | "linkedin" | "medium">("all");

  const filteredPosts = selectedPlatform === "all" 
    ? mockBlogPosts 
    : mockBlogPosts.filter(post => post.platform === selectedPlatform);

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
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedPlatform === "all" ? "default" : "outline"}
            onClick={() => setSelectedPlatform("all")}
            className="flex items-center space-x-2"
          >
            <span>All Posts</span>
            <Badge variant="secondary" className="ml-2">
              {mockBlogPosts.length}
            </Badge>
          </Button>
          <Button
            variant={selectedPlatform === "linkedin" ? "default" : "outline"}
            onClick={() => setSelectedPlatform("linkedin")}
            className="flex items-center space-x-2"
          >
            <Linkedin size={16} />
            <span>LinkedIn</span>
            <Badge variant="secondary" className="ml-2">
              {mockBlogPosts.filter(p => p.platform === "linkedin").length}
            </Badge>
          </Button>
          <Button
            variant={selectedPlatform === "medium" ? "default" : "outline"}
            onClick={() => setSelectedPlatform("medium")}
            className="flex items-center space-x-2"
          >
            <Hash size={16} />
            <span>Medium</span>
            <Badge variant="secondary" className="ml-2">
              {mockBlogPosts.filter(p => p.platform === "medium").length}
            </Badge>
          </Button>
        </div>

        {/* Blog posts grid */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
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
                        {post.platform === "linkedin" ? (
                          <Linkedin size={14} className="text-blue-600" />
                        ) : (
                          <Hash size={14} className="text-green-600" />
                        )}
                        <span className="capitalize font-medium">{post.platform}</span>
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

        {/* No posts message */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">
              No posts found for the selected platform.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
