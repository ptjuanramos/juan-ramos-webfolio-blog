
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: (e.clientX - centerX) / 20,
          y: (e.clientY - centerY) / 20,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleBlogClick = () => {
    navigate("/blog");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main visit card */}
      <div
        ref={cardRef}
        className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20 transition-all duration-300 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) translateZ(${isHovered ? 20 : 0}px)`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
        
        <div className="relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            JR
          </div>

          {/* Name and title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Juan Ramos
            </h1>
            <p className="text-purple-200 text-lg font-medium">
              Software Engineer
            </p>
            <p className="text-slate-300 text-sm mt-2">
              Architecture • AI • Software Engineering
            </p>
          </div>

          {/* Social links */}
          <div className="flex justify-center space-x-4 mb-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white hover:scale-110 transform"
            >
              <Github size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white hover:scale-110 transform"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="mailto:juan@example.com"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white hover:scale-110 transform"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Blog button */}
          <Button
            onClick={handleBlogClick}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
          >
            <span className="mr-2">Read My Blog</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Button>

          {/* Quote */}
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm italic">
              "Building the future with code and creativity"
            </p>
          </div>
        </div>

        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl" />
      </div>
    </div>
  );
};

export default Index;
