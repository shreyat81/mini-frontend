import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cloud, Upload, Shield, Share2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Cloud className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Mini Drive</h1>
          </div>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-20 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl">
              <Cloud className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Files, Anywhere
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Store, share, and manage your files securely in the cloud. Access your data from anywhere, anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Upload</h3>
            <p className="text-muted-foreground">
              Upload files with a simple click. Drag and drop support coming soon.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-2xl bg-secondary/10">
                <Share2 className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Share Securely</h3>
            <p className="text-muted-foreground">
              Share files with others securely with built-in access controls.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-2xl bg-accent/10">
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Your data is protected with industry-standard encryption.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025 Mini Drive. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
