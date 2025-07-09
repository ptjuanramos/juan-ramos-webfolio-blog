
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, ExternalLink, Hash, Loader2, User, FolderOpen, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Mock projects data
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  date: string;
  status: "completed" | "ongoing" | "planned";
  blogPostUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "E-commerce Microservices Platform",
    description: "Built a scalable e-commerce platform using microservices architecture with Docker and Kubernetes. Implemented event sourcing and CQRS patterns for high performance.",
    technologies: ["Node.js", "Docker", "Kubernetes", "Redis", "PostgreSQL"],
    date: "2024-06-28",
    status: "completed",
    blogPostUrl: "https://medium.com/@juanramos/microservices-patterns",
    githubUrl: "https://github.com/juanramos/ecommerce-microservices"
  },
  {
    id: "2",
    title: "ML Model Deployment Pipeline",
    description: "Developed an end-to-end MLOps pipeline for deploying machine learning models to production with automated testing and monitoring.",
    technologies: ["Python", "MLflow", "Docker", "AWS", "TensorFlow"],
    date: "2024-06-15",
    status: "completed",
    blogPostUrl: "https://medium.com/@juanramos/mlops-production",
    projectUrl: "https://ml-pipeline.example.com"
  },
  {
    id: "3",
    title: "Real-time Analytics Dashboard",
    description: "Created a real-time analytics dashboard for monitoring application performance and user behavior with WebSocket connections.",
    technologies: ["React", "WebSocket", "Chart.js", "Node.js", "MongoDB"],
    date: "2024-07-01",
    status: "ongoing",
    githubUrl: "https://github.com/juanramos/analytics-dashboard"
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
        const mediumRssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@ptjuanramos';
        
        const response = await fetch(mediumRssUrl);
        
        if (!response.ok) {
          throw new Error(`RSS2JSON API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status !== 'ok') {
          throw new Error('RSS2JSON API returned error status');
        }

        // Transform Medium posts to match our expected format
        const transformedPosts = data.items?.map((item: any) => {
          // Extract reading time from content or estimate
          const contentLength = item.content?.length || item.description?.length || 0;
          const estimatedReadTime = Math.max(1, Math.ceil(contentLength / 1000));
          
          // Clean up description/excerpt
          const description = item.description || '';
          const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 200);
          
          return {
            id: item.guid || Math.random().toString(),
            title: item.title || 'Medium Article',
            excerpt: cleanDescription + (cleanDescription.length === 200 ? '...' : ''),
            date: new Date(item.pubDate).toISOString().split('T')[0],
            platform: 'medium' as const,
            url: item.link,
            tags: item.categories || ['Medium', 'Article'],
            readTime: `${estimatedReadTime} min read`
          };
        }) || [];

        // Sort posts by date (newest first)
        transformedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setPosts(transformedPosts);
      } catch (err) {
        console.error('Error fetching Medium posts:', err);
        setError('Failed to load Medium posts');
        // Fallback to mock Medium posts
        setPosts(mockBlogPosts);
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
            <h1 className="text-2xl font-bold text-slate-900">Juan's Space</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText size={16} />
              Blog
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen size={16} />
              Projects
            </TabsTrigger>
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <User size={16} />
              My CV
            </TabsTrigger>
          </TabsList>

          {/* Blog Tab */}
          <TabsContent value="blog" className="mt-6">
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
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-8">
                <Badge variant="secondary" className="text-sm">
                  {mockProjects.length} {mockProjects.length === 1 ? 'project' : 'projects'}
                </Badge>
              </div>

              {mockProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-200">
                            {project.title}
                          </CardTitle>
                          <Badge 
                            variant={project.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatDate(project.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-700 mb-4">
                      {project.description}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-4">
                      {project.blogPostUrl && (
                        <a
                          href={project.blogPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-sm group/link"
                        >
                          <FileText size={14} />
                          <span>Blog Post</span>
                          <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform duration-200" />
                        </a>
                      )}
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm group/link"
                        >
                          <ExternalLink size={14} />
                          <span>Live Project</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 font-medium text-sm group/link"
                        >
                          <Hash size={14} />
                          <span>GitHub</span>
                          <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform duration-200" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CV Tab */}
          <TabsContent value="cv" className="mt-6">
            <div className="space-y-6">
              <Card className="border border-slate-200 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">Juan Ramos</CardTitle>
                  <p className="text-slate-600">Senior Software Engineer & Technical Architect</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact</h3>
                    <div className="text-slate-700 space-y-1">
                      <p>LinkedIn: linkedin.com/in/juanramospt</p>
                      <p>Location: Switzerland</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Languages</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <span className="font-medium text-slate-900">Portuguese</span>
                        <Badge variant="default" className="text-xs">Native (C2)</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <span className="font-medium text-slate-900">English</span>
                        <Badge variant="secondary" className="text-xs">Advanced (C1)</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <span className="font-medium text-slate-900">Spanish</span>
                        <Badge variant="secondary" className="text-xs">Advanced (C1)</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                        <span className="font-medium text-slate-900">German</span>
                        <Badge variant="outline" className="text-xs">Intermediate (B1)</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Experience</h3>
                    <div className="space-y-6">
                      <div className="border-l-2 border-slate-200 pl-4">
                        <h4 className="font-medium text-slate-900">Senior Software Engineer</h4>
                        <p className="text-slate-600 text-sm">UBS • Present</p>
                        <ul className="text-slate-700 text-sm mt-2 space-y-1 list-disc list-inside">
                          <li>Specialized in Autosys, Microservices, REST APIs, and Oracle SQL</li>
                          <li>Engineered and deployed over 30 components in OpenShift and on-premises environments</li>
                          <li>Designed Azure architecture and ensured adherence to UBS technical standards</li>
                          <li>Managed projects, assessed risks, and coordinated with program managers and ITILs</li>
                        </ul>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-4">
                        <h4 className="font-medium text-slate-900">Technical Architect</h4>
                        <p className="text-slate-600 text-sm">Unit4 • 2021 - 2024</p>
                        <ul className="text-slate-700 text-sm mt-2 space-y-1 list-disc list-inside">
                          <li>Architected and led 4 projects including HRMS and ERP systems</li>
                          <li>Designed multi-tenant enterprise message broker for real-time event distribution</li>
                          <li>Led automation initiative for ERP client configuration migration</li>
                          <li>Led architecture reviews supporting €1M cost savings over 2 years</li>
                          <li>Migrated on-premises solutions to Azure (SaaS, PaaS, IaaS)</li>
                        </ul>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-4">
                        <h4 className="font-medium text-slate-900">Software Engineer</h4>
                        <p className="text-slate-600 text-sm">Agap2IT • 2018 - 2021</p>
                        <ul className="text-slate-700 text-sm mt-2 space-y-1 list-disc list-inside">
                          <li>Developed full-stack applications using Java, .NET, MySQL, and Azure</li>
                          <li>Optimized banking application achieving 25% performance increase</li>
                          <li>Achieved 100% sprint delivery with close stakeholder collaboration</li>
                          <li>Implemented Docker applications and deployed on Azure environments</li>
                          <li>Mentored junior developers and maintained code quality standards</li>
                        </ul>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-4">
                        <h4 className="font-medium text-slate-900">Software Engineer</h4>
                        <p className="text-slate-600 text-sm">Mater Dynamics • 2017 - 2018</p>
                        <ul className="text-slate-700 text-sm mt-2 space-y-1 list-disc list-inside">
                          <li>Mentored team of 5 developers and conducted code reviews</li>
                          <li>Worked on pilot projects for client and investor presentations</li>
                          <li>Developed REST APIs with Java, Spring, CodeIgniter, jQuery, HTML/CSS3</li>
                          <li>Implemented mobile apps with NFC scanning for logistics</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Education</h3>
                    <div>
                      <h4 className="font-medium text-slate-900">Bachelor of Science (B.S.) in Computer Engineering</h4>
                      <p className="text-slate-600 text-sm">Faculdade de Ciências da Universidade de Lisboa, Lisbon</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Java", ".NET", "Oracle SQL", "MySQL", "REST APIs", "Microservices", 
                        "Azure", "Docker", "OpenShift", "Autosys", "Spring", "CodeIgniter", 
                        "jQuery", "HTML/CSS3", "HRMS", "ERP Systems", "Cloud Migration", 
                        "Multi-tenant Architecture", "Mobile Development", "NFC"
                      ].map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Download CV Button */}
                  <div className="pt-4">
                    <Button className="w-full sm:w-auto">
                      Download Full CV (PDF)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Blog;
