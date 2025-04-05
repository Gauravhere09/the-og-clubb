
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Headphones, Music2, Waveform, Users, Laptop2 } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
            <Headphones className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold">AudioConnect</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
          <Button onClick={() => navigate('/auth?register=true')}>Sign Up</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                Connect Through Sound
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Record, share, and discover audio content with our innovative platform designed for creators and listeners alike.
              </p>
              <Button 
                size="lg" 
                className="mt-8"
                onClick={() => navigate('/auth?register=true')}
              >
                Get Started For Free
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <FeatureCard 
                icon={<Waveform />} 
                title="High Quality Audio"
                description="Record and listen to crystal clear audio with our professional-grade audio processing."
              />
              <FeatureCard 
                icon={<Users />} 
                title="Growing Community"
                description="Connect with other audio creators and build your audience in our thriving community."
              />
              <FeatureCard 
                icon={<Laptop2 />} 
                title="Easy to Use"
                description="Our intuitive interface makes recording and sharing audio content simpler than ever."
              />
            </div>
          </div>
        </section>

        <section className="bg-muted py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <Music2 className="h-12 w-12 mx-auto mb-6 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Ready to amplify your voice?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of creators who are already using AudioConnect to share their stories, music, and ideas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="default"
                  onClick={() => navigate('/auth?register=true')}
                >
                  Sign Up Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/explore')}
                >
                  Explore Content
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <Headphones className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">AudioConnect</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 AudioConnect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border">
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 text-primary" })}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
